import type { QuestionLocale, SurveyQuestion } from "@prisma/client";
import { parseOptionsJson } from "@/lib/question-types";

export type QuestionWithLocales = SurveyQuestion & {
  locales: QuestionLocale[];
};

/** Published TTS file for the question in the selected locale (English uses `SurveyQuestion`). */
export function getPromptAudioPath(
  q: QuestionWithLocales,
  locale: string,
): string | null {
  if (locale === "en") {
    return q.promptAudioPath ?? null;
  }
  const row = q.locales.find((l) => l.locale === locale);
  return row?.promptAudioPath ?? q.promptAudioPath ?? null;
}

export function getQuestionCopy(
  q: QuestionWithLocales,
  locale: string,
): { prompt: string; options: string[] } {
  if (locale === "en") {
    return {
      prompt: q.prompt,
      options: parseOptionsJson(q.optionsJson),
    };
  }
  const row = q.locales.find((l) => l.locale === locale);
  if (row) {
    return {
      prompt: row.prompt,
      options: parseOptionsJson(row.optionsJson),
    };
  }
  return {
    prompt: q.prompt,
    options: parseOptionsJson(q.optionsJson),
  };
}
