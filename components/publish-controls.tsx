"use client";

import { useRef, useState } from "react";
import { publishSurvey, unpublishSurvey } from "@/app/actions/survey";

export function PublishControls({
  surveyId,
  status,
}: {
  surveyId: string;
  status: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  async function publish() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      await publishSurvey(surveyId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  async function unpublish() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      await unpublishSurvey(surveyId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unpublish failed");
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {status !== "PUBLISHED" ? (
          <button
            type="button"
            disabled={pending}
            onClick={publish}
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:opacity-60"
          >
            {pending ? "Working…" : "Publish & translate"}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={publish}
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:opacity-60"
            >
              {pending ? "Working…" : "Regenerate translations"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={unpublish}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              {pending ? "Working…" : "Unpublish"}
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-slate-600">
        Publishing uses OpenAI to translate prompts/options into Hindi, Tamil,
        Telugu, French, and Spanish. English stays as the source text.
      </p>
      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
