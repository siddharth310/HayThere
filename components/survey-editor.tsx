"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSurvey, updateSurvey } from "@/app/actions/survey";
import { QUESTION_TYPES, type QuestionInput } from "@/lib/question-types";

const emptyQuestion = (): QuestionInput => ({
  prompt: "",
  type: "TEXT",
  options: [],
  audioOnly: false,
});

type Props = {
  mode: "create" | "edit";
  surveyId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialQuestions?: QuestionInput[];
};

export function SurveyEditor({
  mode,
  surveyId,
  initialTitle = "",
  initialDescription = "",
  initialQuestions,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState<QuestionInput[]>(
    initialQuestions?.length ? initialQuestions : [emptyQuestion()],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function addQuestion() {
    setQuestions((q) => [...q, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((q) => q.filter((_, i) => i !== index));
  }

  function moveQuestion(index: number, dir: -1 | 1) {
    setQuestions((q) => {
      const next = [...q];
      const j = index + dir;
      if (j < 0 || j >= next.length) return q;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function patchQuestion(index: number, patch: Partial<QuestionInput>) {
    setQuestions((q) =>
      q.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("description", description);
      fd.set("questions", JSON.stringify(questions));
      if (mode === "create") {
        const res = await createSurvey(fd);
        if (res?.surveyId) {
          router.push(`/portal/surveys/${res.surveyId}/edit`);
        }
      } else if (surveyId) {
        await updateSurvey(surveyId, fd);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-500">
          Survey title
        </label>
        <input
          required
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-500">
          Description (optional)
        </label>
        <textarea
          className="min-h-[88px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Questions</h2>
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:border-sky-400"
          >
            Add question
          </button>
        </div>

        {questions.map((q, i) => (
          <div
            key={q.id ?? i}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded border border-slate-200 px-2 py-1 text-xs"
                onClick={() => moveQuestion(i, -1)}
              >
                Up
              </button>
              <button
                type="button"
                className="rounded border border-slate-200 px-2 py-1 text-xs"
                onClick={() => moveQuestion(i, 1)}
              >
                Down
              </button>
              <button
                type="button"
                className="ml-auto rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-700"
                onClick={() => removeQuestion(i)}
              >
                Remove
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-slate-500">Prompt</label>
                <input
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={q.prompt}
                  onChange={(e) => patchQuestion(i, { prompt: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Type</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={q.type}
                  onChange={(e) =>
                    patchQuestion(i, {
                      type: e.target.value as QuestionInput["type"],
                    })
                  }
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "DROPDOWN"
                        ? "Dropdown"
                        : t === "CHECKBOX"
                          ? "Checkbox"
                          : "Open text"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end pb-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={q.audioOnly}
                    onChange={(e) =>
                      patchQuestion(i, { audioOnly: e.target.checked })
                    }
                  />
                  Capture only via audio
                </label>
              </div>
            </div>

            {(q.type === "DROPDOWN" || q.type === "CHECKBOX") && (
              <div className="mt-3 space-y-1">
                <label className="text-xs text-slate-500">Options</label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="One option per line"
                  value={(q.options ?? []).join("\n")}
                  onChange={(e) =>
                    patchQuestion(i, {
                      options: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:opacity-60"
        >
          {pending ? "Saving…" : mode === "create" ? "Create survey" : "Save"}
        </button>
      </div>
    </form>
  );
}
