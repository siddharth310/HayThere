"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { synthesizeSpeechToMp3Path, translateQuestion } from "@/lib/openai";
import { scriptForLocaleTts, scriptForQuestionTts } from "@/lib/question-tts";
import { slugifyTitle } from "@/lib/slug";
import { isPortalAuthenticated } from "@/lib/portal-auth";
import type { LocaleCode } from "@/lib/locales";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import {
  optionsForType,
  parseOptionsJson,
  questionInputSchema,
  type QuestionInput,
} from "@/lib/question-types";

async function requirePortal() {
  if (!(await isPortalAuthenticated())) {
    throw new Error("Not authorized");
  }
}

function stringifyOptions(type: string, options: string[] | undefined): string | null {
  const o = optionsForType(type as QuestionInput["type"], options ?? []);
  return o ? JSON.stringify(o) : null;
}

export async function createSurvey(
  formData: FormData,
): Promise<{ surveyId: string }> {
  await requirePortal();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const description = String(formData.get("description") ?? "").trim() || null;
  const questionsRaw = String(formData.get("questions") ?? "[]");
  let questions: QuestionInput[];
  try {
    const parsed = JSON.parse(questionsRaw) as unknown;
    questions = zodQuestions(parsed);
  } catch {
    throw new Error("Invalid questions payload");
  }

  const baseSlug = slugifyTitle(title);
  const slug = await uniqueSlug(baseSlug);

  const survey = await prisma.survey.create({
    data: {
      title,
      description,
      slug,
      status: "DRAFT",
      questions: {
        create: questions.map((q, i) => ({
          orderIndex: i,
          prompt: q.prompt,
          type: q.type,
          optionsJson: stringifyOptions(q.type, q.options),
          audioOnly: q.audioOnly,
        })),
      },
    },
  });

  revalidatePath("/portal");
  return { surveyId: survey.id };
}

export async function updateSurvey(surveyId: string, formData: FormData) {
  await requirePortal();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const description = String(formData.get("description") ?? "").trim() || null;
  const questionsRaw = String(formData.get("questions") ?? "[]");
  let questions: QuestionInput[];
  try {
    questions = zodQuestions(JSON.parse(questionsRaw));
  } catch {
    throw new Error("Invalid questions payload");
  }

  const existing = await prisma.surveyQuestion.findMany({
    where: { surveyId },
  });

  await prisma.$transaction(async (tx) => {
    await tx.survey.update({
      where: { id: surveyId },
      data: { title, description, status: "DRAFT" },
    });

    await tx.questionLocale.deleteMany({
      where: { question: { surveyId } },
    });

    await tx.surveyQuestion.updateMany({
      where: { surveyId },
      data: { promptAudioPath: null },
    });

    const kept = new Set<string>();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const data = {
        orderIndex: i,
        prompt: q.prompt,
        type: q.type,
        optionsJson: stringifyOptions(q.type, q.options),
        audioOnly: q.audioOnly,
      };

      if (q.id) {
        const row = existing.find((e) => e.id === q.id);
        if (row) {
          await tx.surveyQuestion.update({
            where: { id: q.id },
            data,
          });
          kept.add(q.id);
          continue;
        }
      }

      const created = await tx.surveyQuestion.create({
        data: { surveyId, ...data },
      });
      kept.add(created.id);
    }

    const toRemove = existing.filter((e) => !kept.has(e.id));
    if (toRemove.length) {
      await tx.surveyQuestion.deleteMany({
        where: { id: { in: toRemove.map((r) => r.id) } },
      });
    }
  });

  revalidatePath("/portal");
  revalidatePath(`/portal/surveys/${surveyId}/edit`);
  revalidatePath(`/portal/surveys/${surveyId}/preview`);
  revalidatePath("/field");
}

export async function publishSurvey(surveyId: string) {
  await requirePortal();
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });
  if (!survey) throw new Error("Survey not found");

  await prisma.surveyQuestion.updateMany({
    where: { surveyId },
    data: { promptAudioPath: null },
  });

  const nonEnglishLocales = SUPPORTED_LOCALES.filter(
    (l) => l.code !== "en",
  ).map((l) => l.code as LocaleCode);

  await prisma.questionLocale.deleteMany({
    where: {
      question: { surveyId },
      locale: { notIn: nonEnglishLocales },
    },
  });

  for (const q of survey.questions) {
    const opts = parseOptionsJson(q.optionsJson);

    for (const loc of nonEnglishLocales) {
      const { prompt, options } = await translateQuestion(
        q.prompt,
        opts.length ? opts : null,
        loc,
      );
      await prisma.questionLocale.upsert({
        where: {
          questionId_locale: {
            questionId: q.id,
            locale: loc,
          },
        },
        create: {
          questionId: q.id,
          locale: loc,
          prompt,
          optionsJson: options ? JSON.stringify(options) : null,
          promptAudioPath: null,
        },
        update: {
          prompt,
          optionsJson: options ? JSON.stringify(options) : null,
          promptAudioPath: null,
        },
      });
    }
  }

  const published = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: {
          locales: {
            where: { locale: { in: nonEnglishLocales } },
          },
        },
      },
    },
  });
  if (!published) throw new Error("Survey not found after publish step");

  for (const q of published.questions) {
    const enPath = await synthesizeSpeechToMp3Path(scriptForQuestionTts(q));
    await prisma.surveyQuestion.update({
      where: { id: q.id },
      data: { promptAudioPath: enPath },
    });

    for (const row of q.locales) {
      const path = await synthesizeSpeechToMp3Path(
        scriptForLocaleTts(q.type, row.prompt, row.optionsJson),
      );
      await prisma.questionLocale.upsert({
        where: {
          questionId_locale: {
            questionId: q.id,
            locale: row.locale as LocaleCode,
          },
        },
        create: {
          questionId: q.id,
          locale: row.locale,
          prompt: row.prompt,
          optionsJson: row.optionsJson,
          promptAudioPath: path,
        },
        update: { promptAudioPath: path },
      });
    }
  }

  await prisma.survey.update({
    where: { id: surveyId },
    data: { status: "PUBLISHED" },
  });

  revalidatePath("/portal");
  revalidatePath(`/portal/surveys/${surveyId}/edit`);
  revalidatePath(`/portal/surveys/${surveyId}/preview`);
  revalidatePath("/field");
}

export async function unpublishSurvey(surveyId: string) {
  await requirePortal();
  await prisma.survey.update({
    where: { id: surveyId },
    data: { status: "DRAFT" },
  });
  revalidatePath("/portal");
  revalidatePath("/field");
}

function zodQuestions(parsed: unknown): QuestionInput[] {
  const arr = z.array(questionInputSchema).parse(parsed);
  return arr;
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (await prisma.survey.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}
