import { Fragment } from "react";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { prisma } from "@/lib/prisma";
import {
  extractAnswerValueDisplay,
  extractNumericAnswerDisplay,
  type AnswerValueDisplay,
  type NumericAnswerDisplay,
} from "@/lib/answer-display";
import { localeLabel } from "@/lib/locales";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function SurveyResponsesPage({ params }: PageProps) {
  const { id } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
      responses: {
        orderBy: { createdAt: "desc" },
        include: {
          answers: true,
        },
      },
    },
  });

  if (!survey) notFound();

  const questions = survey.questions;

  const rows = survey.responses.map((r) => {
    const byQuestion = new Map(r.answers.map((a) => [a.questionId, a]));
    return { response: r, byQuestion };
  });

  return (
    <>
      <PageIntro
        eyebrow="Portal"
        title="Responses"
        description={survey.title}
        backHref={`/portal/surveys/${survey.id}/edit`}
        backLabel="Edit survey"
      />

      {rows.length === 0 ? (
        <p className="text-slate-600">
          No responses yet. Publish the survey and complete it from the field
          app.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur">
            <table className="w-max min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/95">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-20 min-w-[140px] border-r border-slate-200 bg-slate-50 px-3 py-3 align-bottom text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Submitted
                  </th>
                  <th
                    rowSpan={2}
                    className="min-w-[100px] border-r border-slate-200 px-3 py-3 align-bottom text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Locale
                  </th>
                  {questions.map((q, i) => (
                    <th
                      key={q.id}
                      colSpan={3}
                      className="border-r border-slate-200 px-3 py-3 text-center text-xs font-semibold text-slate-900 last:border-r-0"
                      title={q.prompt}
                    >
                      <span className="text-slate-500">Q{i + 1}</span>
                      <span className="mt-1 line-clamp-2 block font-normal normal-case tracking-normal text-slate-500">
                        {q.prompt}
                      </span>
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  {questions.map((q) => (
                    <Fragment key={q.id}>
                      <th className="min-w-[140px] border-r border-slate-200 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Value
                      </th>
                      <th className="min-w-[110px] border-r border-slate-200 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Number
                      </th>
                      <th className="min-w-[160px] border-r border-slate-200 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 last:border-r-0">
                        Answer audio
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ response: r, byQuestion }, rowIdx) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 last:border-b-0 odd:bg-slate-50/50"
                  >
                    <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2.5 align-top text-xs text-slate-900 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.06)]">
                      <span className="text-slate-500">#{rowIdx + 1}</span>
                      <br />
                      {r.createdAt.toLocaleString()}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2.5 align-top text-xs text-slate-800">
                      {localeLabel(r.locale)}
                    </td>
                    {questions.flatMap((q) => {
                      const a = byQuestion.get(q.id);
                      const valueDisp = a
                        ? extractAnswerValueDisplay(a.valueJson)
                        : ({ kind: "empty" } satisfies AnswerValueDisplay);
                      const numericDisp = a
                        ? extractNumericAnswerDisplay(a.valueJson)
                        : ({ kind: "empty" } satisfies NumericAnswerDisplay);
                      return [
                        <td
                          key={`${r.id}-${q.id}-v`}
                          className="border-r border-slate-200 px-2 py-2 align-top text-xs"
                        >
                          {a ? (
                            <ValueCell display={valueDisp} />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>,
                        <td
                          key={`${r.id}-${q.id}-n`}
                          className="border-r border-slate-200 px-2 py-2 align-top text-xs"
                        >
                          {a ? (
                            <NumericCell display={numericDisp} />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>,
                        <td
                          key={`${r.id}-${q.id}-a`}
                          className="border-r border-slate-200 px-2 py-2 align-top text-xs last:border-r-0"
                        >
                          {a?.audioPath ? (
                            <audio
                              controls
                              className="h-8 w-full max-w-[200px]"
                              preload="metadata"
                              src={`/api/uploads/${a.audioPath}`}
                            />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>,
                      ];
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}

function NumericCell({ display }: { display: NumericAnswerDisplay }) {
  if (display.kind === "empty") {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <span className="font-mono tabular-nums text-slate-900">
      {display.display}
    </span>
  );
}

function ValueCell({ display }: { display: AnswerValueDisplay }) {
  if (display.kind === "empty") {
    return <span className="text-slate-400">—</span>;
  }
  if (display.kind === "number") {
    return (
      <span className="font-mono tabular-nums text-slate-900">
        {display.display}
      </span>
    );
  }
  return (
    <span className="whitespace-pre-wrap break-words text-slate-800">
      {display.display}
    </span>
  );
}
