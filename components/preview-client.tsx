"use client";

import { useMemo, useState } from "react";
import type { QuestionWithLocales } from "@/lib/survey-display";
import { getPromptAudioPath, getQuestionCopy } from "@/lib/survey-display";
import { SUPPORTED_LOCALES } from "@/lib/locales";

export function PreviewClient({
  questions,
}: {
  questions: QuestionWithLocales[];
}) {
  const [locale, setLocale] = useState("en");

  const items = useMemo(() => {
    return questions.map((q) => {
      const copy = getQuestionCopy(q, locale);
      return {
        id: q.id,
        ...copy,
        type: q.type,
        audioOnly: q.audioOnly,
        promptAudio: getPromptAudioPath(q, locale),
      };
    });
  }, [questions, locale]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-500">Preview language</label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {SUPPORTED_LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {items.map((q, i) => (
          <div
            key={q.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Question {i + 1} · {q.type}
              {q.audioOnly ? " · audio only" : ""}
            </p>
            {q.promptAudio ? (
              <div className="mt-2 rounded-lg border border-slate-200 bg-sky-50/80 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Play question
                </p>
                <audio
                  className="mt-2 w-full max-w-md"
                  controls
                  preload="metadata"
                  src={`/api/uploads/${q.promptAudio}`}
                />
              </div>
            ) : null}
            <p className="mt-2 text-base font-medium">{q.prompt}</p>
            {q.type === "DROPDOWN" && (
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-500">
                {q.options.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            )}
            {q.type === "CHECKBOX" && (
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-500">
                {q.options.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            )}
            {q.type === "TEXT" && (
              <p className="mt-3 text-sm text-slate-500">
                Open text answer (field users type or speak depending on your
                settings).
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
