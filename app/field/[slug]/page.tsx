import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { SurveyRunner } from "@/components/survey-runner";
import { prisma } from "@/lib/prisma";
import { localeLabel } from "@/lib/locales";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function FieldSurveyPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang =
    typeof sp.lang === "string" && sp.lang.length ? sp.lang : "en";

  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { locales: true },
      },
    },
  });

  if (!survey || survey.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="Field capture"
        title={survey.title}
        description={`Language: ${localeLabel(lang)} · Listen to each question, answer by voice or touch, then submit once.`}
        backHref={`/field?lang=${encodeURIComponent(lang)}`}
        backLabel="All surveys"
      />
      <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-6">
        <SurveyRunner
          surveyId={survey.id}
          locale={lang}
          questions={survey.questions}
        />
      </div>
    </>
  );
}
