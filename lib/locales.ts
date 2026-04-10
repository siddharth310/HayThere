export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "bn", label: "Bengali" },
  { code: "or", label: "Odia" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export function localeLabel(code: string): string {
  return SUPPORTED_LOCALES.find((l) => l.code === code)?.label ?? code;
}
