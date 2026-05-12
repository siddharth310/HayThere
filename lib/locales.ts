export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export function isSupportedLocale(
  code: string | undefined,
): code is LocaleCode {
  if (!code) return false;
  return SUPPORTED_LOCALES.some((l) => l.code === code);
}

/** BCP-47 for `SpeechSynthesisUtterance` (best-effort for supported languages). */
export function bcp47ForSpeechLocale(code: string): string {
  const map: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    ta: "ta-IN",
    te: "te-IN",
    fr: "fr-FR",
    es: "es-ES",
  };
  return map[code] ?? "en-US";
}

export function localeLabel(code: string): string {
  return SUPPORTED_LOCALES.find((l) => l.code === code)?.label ?? code;
}
