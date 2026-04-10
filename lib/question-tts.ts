import type { SurveyQuestion } from "@prisma/client";
import { parseOptionsJson } from "@/lib/question-types";

/** Text passed to TTS for a question (English source). */
export function scriptForQuestionTts(
  q: Pick<SurveyQuestion, "prompt" | "type" | "optionsJson">,
): string {
  const opts = parseOptionsJson(q.optionsJson);
  if (
    (q.type === "DROPDOWN" || q.type === "CHECKBOX") &&
    opts.length > 0
  ) {
    return `${q.prompt} Options: ${opts.join(", ")}.`;
  }
  return q.prompt;
}

/** Translated prompt + options for TTS. */
export function scriptForLocaleTts(
  type: string,
  prompt: string,
  optionsJson: string | null,
): string {
  const opts = parseOptionsJson(optionsJson);
  if ((type === "DROPDOWN" || type === "CHECKBOX") && opts.length > 0) {
    return `${prompt} Options: ${opts.join(", ")}.`;
  }
  return prompt;
}
