import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { PreviewClient } from "@/components/preview-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function PreviewSurveyPage({ params }: PageProps) {
  const { id } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { locales: true },
      },
    },
  });

  if (!survey) notFound();

  const hasLocales = survey.questions.some((q) => q.locales.length > 0);

  return (
    <>
      <PageIntro
        eyebrow="Portal"
        title={`Preview · ${survey.title}`}
        description={
          survey.status === "PUBLISHED" && hasLocales
            ? "Translations are loaded for non-English languages."
            : "Draft or not yet published — non-English previews fall back to English until you publish."
        }
        backHref={`/portal/surveys/${survey.id}/edit`}
        backLabel="Edit survey"
      />
      <div className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-8">
        <PreviewClient questions={survey.questions} />
      </div>
    </>
  );
}
