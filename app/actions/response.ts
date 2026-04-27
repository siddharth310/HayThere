"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { transcribeAudio, translateToEnglish } from "@/lib/openai";
import { saveAudioBuffer } from "@/lib/uploads";
import type { QuestionType } from "@/lib/question-types";

type AnswerPayload =
  | { kind: "text"; value: string }
  | { kind: "dropdown"; value: string }
  | { kind: "checkbox"; value: string[] }
  | { kind: "audio" };

export async function submitResponse(formData: FormData) {
  const surveyId = String(formData.get("surveyId") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const answersRaw = String(formData.get("answers") ?? "{}");

  if (!surveyId) throw new Error("Missing survey");

  let answersMap: Record<string, AnswerPayload>;
  try {
    answersMap = JSON.parse(answersRaw) as Record<string, AnswerPayload>;
  } catch {
    throw new Error("Invalid answers");
  }

  const getPayload = (qid: string): AnswerPayload | undefined =>
    answersMap[qid];

  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, status: "PUBLISHED" },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });

  if (!survey) throw new Error("Survey is not available");

  const responseRow = await prisma.surveyResponse.create({
    data: {
      surveyId,
      locale,
    },
  });

  for (const q of survey.questions) {
    const audio = formData.get(`audio_${q.id}`) as File | null;
    const hasAudio = audio && typeof audio === "object" && audio.size > 0;

    let valueJson: string | null = null;
    let audioPath: string | null = null;
    let transcriptRaw: string | null = null;
    let transcriptEn: string | null = null;

    const payload = getPayload(q.id);

    if (hasAudio) {
      const buf = Buffer.from(await audio.arrayBuffer());
      const ext = pickExt(audio.type, audio.name);
      const rel = await saveAudioBuffer(buf, ext);
      audioPath = rel;
      transcriptRaw = await transcribeAudio(
        buf,
        audio.type || "audio/webm",
        audio.name || `answer${ext}`,
      );
      transcriptEn = await translateToEnglish(transcriptRaw, locale);

      const merged = mergeAudioWithPayload(
        q.type as QuestionType,
        q.audioOnly,
        transcriptRaw,
        transcriptEn,
        payload,
      );
      valueJson = merged;
    } else {
      if (q.audioOnly) {
        throw new Error(`Question requires audio: ${q.prompt.slice(0, 40)}…`);
      }
      if (!payload) {
        throw new Error(`Missing answer for: ${q.prompt.slice(0, 40)}…`);
      }
      valueJson = JSON.stringify(payload);
    }

    await prisma.answer.create({
      data: {
        responseId: responseRow.id,
        questionId: q.id,
        valueJson,
        audioPath,
        transcriptRaw,
        transcriptEn,
      },
    });
  }

  revalidatePath(`/portal/surveys/${surveyId}/responses`);
  revalidatePath("/portal");

  return { ok: true as const, responseId: responseRow.id };
}

function pickExt(mime: string, name: string): string {
  if (mime.includes("webm")) return ".webm";
  if (mime.includes("mp4")) return ".m4a";
  if (mime.includes("wav")) return ".wav";
  if (name.endsWith(".webm")) return ".webm";
  return ".webm";
}

function mergeAudioWithPayload(
  type: QuestionType,
  audioOnly: boolean,
  raw: string,
  en: string,
  payload: AnswerPayload | undefined,
): string {
  if (audioOnly || !payload || payload.kind === "audio") {
    return JSON.stringify({
      kind: "audio",
      transcriptRaw: raw,
      transcriptEn: en,
      structured: inferStructuredFromTranscript(type, raw, en),
    });
  }
  return JSON.stringify({
    ...payload,
    transcriptRaw: raw,
    transcriptEn: en,
  });
}

/** Best-effort: keep transcript text in structured for analytics. */
function inferStructuredFromTranscript(
  type: QuestionType,
  raw: string,
  en: string,
): unknown {
  const text = en || raw;
  if (type === "TEXT") return { text };
  if (type === "DROPDOWN") return { selectedText: text };
  if (type === "CHECKBOX") return { selectedText: text };
  return { text };
}
