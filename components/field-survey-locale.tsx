import Link from "next/link";
import { SUPPORTED_LOCALES, type LocaleCode } from "@/lib/locales";

const btn = (active: boolean) =>
  `min-h-[52px] rounded-2xl border px-4 py-3 text-center text-base font-semibold transition ${
    active
      ? "border-sky-400 bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md"
      : "border-slate-200 bg-white text-slate-800 hover:border-sky-300"
  }`;

type Props = {
  slug: string;
  current?: LocaleCode;
};

/**
 * On-survey language choice: TTS, translations, and read-aloud use this locale.
 * Training on /field is not language-specific.
 */
export function FieldSurveyLanguagePicker({ slug, current }: Props) {
  return (
    <section className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Question &amp; audio language
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Pick how you want questions read and (when available) translated. You can
        change this on the next screen.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {SUPPORTED_LOCALES.map((l) => (
          <Link
            key={l.code}
            href={`/field/${encodeURIComponent(slug)}?lang=${l.code}`}
            className={btn(current ? current === l.code : false)}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Compact row when a language is already selected — switch without leaving the survey. */
export function FieldSurveyLanguageStrip({ slug, current }: Props & { current: LocaleCode }) {
  return (
    <section className="rounded-2xl border border-sky-200/80 bg-sky-50/80 p-4 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Question &amp; audio language
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUPPORTED_LOCALES.map((l) => (
          <Link
            key={l.code}
            href={`/field/${encodeURIComponent(slug)}?lang=${l.code}`}
            className={`min-h-[44px] min-w-[5rem] flex-1 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold sm:min-w-0 sm:flex-initial ${
              current === l.code
                ? "border-sky-500 bg-white text-sky-900 shadow-sm"
                : "border-slate-200/80 bg-white/90 text-slate-700 hover:border-sky-300"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
