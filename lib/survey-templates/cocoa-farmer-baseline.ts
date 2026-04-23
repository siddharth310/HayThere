import type { QuestionInput } from "@/lib/question-types";

const yn = (opts: { preferNot?: boolean; unsure?: boolean } = {}): string[] => {
  if (opts.preferNot) return ["Yes", "No", "Prefer not to say"];
  if (opts.unsure) return ["Yes", "No", "Unsure"];
  return ["Yes", "No"];
};

/**
 * Cocoa / farmer household template — questions typed for HayThere (DROPDOWN, TEXT).
 * Section labels are in the prompt text; open numerics are TEXT.
 */
export const COCOA_FARMER_BASELINE = {
  title: "Cocoa farm & household survey",
  description:
    "Context & leadership, household and education, cocoa plots and land, year-on-year changes, and production & yield. Edit or translate after save.",
  questions: [
    {
      type: "TEXT" as const,
      prompt:
        "Section 1 – Survey context. Capture the current location of the survey (e.g. community, district, or notes on GPS if collected).",
      options: [],
      audioOnly: false,
    },
    {
      type: "DROPDOWN" as const,
      prompt: "Do you hold a leadership position within the farmer group?",
      options: yn({ preferNot: true }),
      audioOnly: false,
    },
    {
      type: "DROPDOWN" as const,
      prompt: "Does the farmer hold any leadership position?",
      options: yn({ preferNot: true }),
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "Section 2 – Household & education. How many individuals in your household depend on your income for their livelihood? (Include yourself, other adults, children, and elderly.)",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "How many school-aged children (5–17 years) are in your household?",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "How many school-aged children in your household are currently attending school?",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "What percentage of school-aged children in your household are attending school?",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "Section 3 – Cocoa plots & land area. How many cocoa plots do you own or manage? (Include rented and sharecropped plots.)",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt: "How many of these plots are larger than 4 hectares?",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "What is the total estimated area (in hectares) of all your cocoa plots?",
      options: [],
      audioOnly: false,
    },
    {
      type: "DROPDOWN" as const,
      prompt:
        "Section 4 – Year-on-year changes. Has the number of your cocoa plots changed compared to last year?",
      options: yn({ unsure: true }),
      audioOnly: false,
    },
    {
      type: "DROPDOWN" as const,
      prompt:
        "Has the total area of your cocoa plots changed compared to last year?",
      options: yn({ unsure: true }),
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "What is the change in the number of cocoa plots? (e.g. +2, −1, or 0 if none.)",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "What is the change in the total farm area? (e.g. hectares; use 0 or “no change” if none.)",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "Section 5 – Production & yield. What quantity (in kg) of dry cocoa beans did you produce across all cocoa plots during the last full crop cycle?",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "What quantity (in kg) of wet cocoa beans did you produce across all cocoa plots during the last full crop cycle?",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "What is the total estimated production (in kg of dried beans)?",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt: "What is the estimated yield per hectare? (kg/ha)",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt: "What is the estimated yield per tree? (kg per tree, or as collected)",
      options: [],
      audioOnly: false,
    },
    {
      type: "TEXT" as const,
      prompt:
        "What is the average change in productivity (kg/ha) compared to the previous season or cycle?",
      options: [],
      audioOnly: false,
    },
  ] satisfies QuestionInput[],
};
