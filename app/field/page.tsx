import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { prisma } from "@/lib/prisma";
import { SUPPORTED_LOCALES } from "@/lib/locales";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function FieldHomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const lang =
    typeof sp.lang === "string" && sp.lang.length ? sp.lang : "en";

  const surveys = await prisma.survey.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageIntro
        eyebrow="Field capture"
        title="Choose language & survey"
        description="Same steps everywhere: pick how you want to hear questions, then open a published survey. Large touch targets for gloves, pockets, and hurry."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Language
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SUPPORTED_LOCALES.map((l) => (
              <Link
                key={l.code}
                href={`/field?lang=${l.code}`}
                className={`min-h-[52px] rounded-2xl border px-4 py-3 text-center text-base font-semibold transition ${
                  lang === l.code
                    ? "border-sky-400 bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-800 hover:border-sky-300"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Published surveys
          </p>
          {surveys.length === 0 ? (
            <p className="mt-4 text-slate-600">
              None yet. Publish a survey from the portal first.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {surveys.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/field/${s.slug}?lang=${encodeURIComponent(lang)}`}
                    className="flex min-h-[52px] items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 transition hover:border-sky-300 hover:bg-sky-50/80"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
