import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { PublishControls } from "@/components/publish-controls";
import { SurveyEditor } from "@/components/survey-editor";
import { prisma } from "@/lib/prisma";
import { parseOptionsJson } from "@/lib/question-types";
import type { QuestionInput } from "@/lib/question-types";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditSurveyPage({ params }: PageProps) {
  const { id } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });

  if (!survey) notFound();

  const initialQuestions: QuestionInput[] = survey.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    type: q.type as QuestionInput["type"],
    options: parseOptionsJson(q.optionsJson),
    audioOnly: q.audioOnly,
  }));

  return (
    <>
      <PageIntro
        eyebrow="Portal"
        title="Edit survey"
        description={`Slug: ${survey.slug}`}
        backHref="/portal"
        backLabel="All surveys"
        actions={
          <>
            <Link
              href={`/portal/surveys/${survey.id}/preview`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Preview
            </Link>
            <Link
              href={`/portal/surveys/${survey.id}/responses`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Responses
            </Link>
          </>
        }
      />

      <div className="mb-6 rounded-2xl border border-white/80 bg-white/90 p-5 shadow-lg backdrop-blur">
        <p className="text-sm text-slate-600">
          Status:{" "}
          <span className="font-semibold text-slate-900">{survey.status}</span>
        </p>
        <div className="mt-3">
          <PublishControls surveyId={survey.id} status={survey.status} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-8">
        <SurveyEditor
          mode="edit"
          surveyId={survey.id}
          initialTitle={survey.title}
          initialDescription={survey.description ?? ""}
          initialQuestions={initialQuestions}
        />
      </div>
    </>
  );
}
