import { z } from "zod";

export const QUESTION_TYPES = ["DROPDOWN", "CHECKBOX", "TEXT"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const questionInputSchema = z.object({
  id: z.string().optional(),
  prompt: z.string().min(1, "Question text is required"),
  type: z.enum(QUESTION_TYPES),
  options: z.array(z.string()).optional(),
  audioOnly: z.boolean().default(false),
});

export type QuestionInput = z.infer<typeof questionInputSchema>;

export function parseOptionsJson(s: string | null): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s) as unknown;
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function optionsForType(
  type: QuestionType,
  options: string[],
): string[] | null {
  if (type === "TEXT") return null;
  return options.length ? options : ["Option 1"];
}
