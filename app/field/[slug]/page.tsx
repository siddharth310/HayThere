import { notFound } from "next/navigation";
import {
  FieldSurveyLanguagePicker,
  FieldSurveyLanguageStrip,
} from "@/components/field-survey-locale";
import { PageIntro } from "@/components/page-intro";
import { SurveyRunner } from "@/components/survey-runner";
import { prisma } from "@/lib/prisma";
import { isSupportedLocale, localeLabel } from "@/lib/locales";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function FieldSurveyPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const rawLang = typeof sp.lang === "string" && sp.lang.length ? sp.lang : undefined;
  const langOk = isSupportedLocale(rawLang);
  const lang = langOk ? rawLang : null;

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

  if (!lang) {
    return (
      <>
        <PageIntro
          eyebrow="Field capture"
          title={survey.title}
          description="Choose the language for question audio and translations for this visit. You can change it on the next step."
          backHref="/field"
          backLabel="All surveys & training"
        />
        <FieldSurveyLanguagePicker slug={slug} />
      </>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="Field capture"
        title={survey.title}
        description={`Language: ${localeLabel(lang)} · Listen to each question, answer by voice or touch, then submit once.`}
        backHref="/field"
        backLabel="All surveys & training"
      />
      <div className="flex flex-col gap-4">
        <FieldSurveyLanguageStrip slug={slug} current={lang} />
        <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-6">
          <SurveyRunner
            surveyId={survey.id}
            locale={lang}
            questions={survey.questions}
          />
        </div>
      </div>
    </>
  );
}
