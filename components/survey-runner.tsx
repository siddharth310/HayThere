"use client";

import { useEffect, useRef, useState } from "react";
import { submitResponse } from "@/app/actions/response";
import type { QuestionWithLocales } from "@/lib/survey-display";
import { QuestionAudioPlayer } from "@/components/question-audio-player";
import { getPromptAudioPath, getQuestionCopy } from "@/lib/survey-display";

type Props = {
  surveyId: string;
  locale: string;
  questions: QuestionWithLocales[];
};

export function SurveyRunner({ surveyId, locale, questions }: Props) {
  const [doneId, setDoneId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [dropdown, setDropdown] = useState<Record<string, string>>({});
  const [checkbox, setCheckbox] = useState<Record<string, Set<string>>>({});
  const [text, setText] = useState<Record<string, string>>({});

  const [audioBlobs, setAudioBlobs] = useState<Record<string, Blob>>({});
  const [recording, setRecording] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    const init: Record<string, Set<string>> = {};
    for (const q of questions) {
      if (q.type === "CHECKBOX") init[q.id] = new Set();
    }
    setCheckbox(init);
  }, [questions]);

  function toggleCheckbox(qid: string, opt: string) {
    setCheckbox((prev) => {
      const next = { ...prev };
      const set = new Set(next[qid] ?? []);
      if (set.has(opt)) set.delete(opt);
      else set.add(opt);
      next[qid] = set;
      return next;
    });
  }

  async function startRecording(qid: string) {
    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRef.current.ondataavailable = (ev) => {
      if (ev.data.size) chunksRef.current.push(ev.data);
    };
    mediaRef.current.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlobs((prev) => ({ ...prev, [qid]: blob }));
      setRecording(null);
    };
    mediaRef.current.start();
    setRecording(qid);
  }

  function stopRecording() {
    mediaRef.current?.stop();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("surveyId", surveyId);
      fd.set("locale", locale);

      const answers: Record<string, unknown> = {};

      for (const q of questions) {
        const copy = getQuestionCopy(q, locale);

        if (q.audioOnly) {
          const blob = audioBlobs[q.id];
          if (!blob) {
            throw new Error(`Please record audio for: ${copy.prompt.slice(0, 48)}…`);
          }
          fd.append(
            `audio_${q.id}`,
            new File([blob], "answer.webm", { type: "audio/webm" }),
          );
          answers[q.id] = { kind: "audio" };
          continue;
        }

        const blob = audioBlobs[q.id];
        if (blob) {
          fd.append(
            `audio_${q.id}`,
            new File([blob], "answer.webm", { type: "audio/webm" }),
          );
        }

        if (q.type === "DROPDOWN") {
          const v = dropdown[q.id];
          if (!v) throw new Error(`Select an option for: ${copy.prompt.slice(0, 48)}…`);
          answers[q.id] = { kind: "dropdown", value: v };
        } else if (q.type === "CHECKBOX") {
          const set = checkbox[q.id] ?? new Set();
          const arr = Array.from(set);
          if (!arr.length) {
            throw new Error(`Pick at least one option for: ${copy.prompt.slice(0, 48)}…`);
          }
          answers[q.id] = { kind: "checkbox", value: arr };
        } else {
          const v = (text[q.id] ?? "").trim();
          if (!v && !blob) {
            throw new Error(`Please answer: ${copy.prompt.slice(0, 48)}…`);
          }
          if (!v && blob) {
            answers[q.id] = { kind: "text", value: "" };
          } else {
            answers[q.id] = { kind: "text", value: v };
          }
        }
      }

      fd.set("answers", JSON.stringify(answers));

      const res = await submitResponse(fd);
      if (res.ok) setDoneId(res.responseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setPending(false);
    }
  }

  if (doneId) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-lg font-semibold">Response received</p>
        <p className="mt-2 text-sm text-slate-500">
          Thank you. Your answers are recorded.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {questions.map((q) => {
        const copy = getQuestionCopy(q, locale);
        const promptAudio = getPromptAudioPath(q, locale);
        return (
          <div
            key={q.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="mb-3">
              <QuestionAudioPlayer
                fileSrc={
                  promptAudio ? `/api/uploads/${promptAudio}` : null
                }
                readAloudText={copy.prompt}
                locale={locale}
              />
            </div>
            <p className="text-base font-medium">{copy.prompt}</p>
            {q.audioOnly ? (
              <AudioBlock
                qid={q.id}
                recording={recording}
                onStart={() => startRecording(q.id)}
                onStop={stopRecording}
                blob={audioBlobs[q.id]}
              />
            ) : (
              <>
                {q.type === "DROPDOWN" && (
                  <select
                    className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-base"
                    value={dropdown[q.id] ?? ""}
                    onChange={(e) =>
                      setDropdown((d) => ({ ...d, [q.id]: e.target.value }))
                    }
                  >
                    <option value="">Choose…</option>
                    {copy.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                )}
                {q.type === "CHECKBOX" && (
                  <div className="mt-3 flex flex-col gap-2">
                    {copy.options.map((o) => (
                      <label
                        key={o}
                        className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={checkbox[q.id]?.has(o) ?? false}
                          onChange={() => toggleCheckbox(q.id, o)}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "TEXT" && (
                  <textarea
                    className="mt-3 min-h-[120px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-base"
                    value={text[q.id] ?? ""}
                    onChange={(e) =>
                      setText((t) => ({ ...t, [q.id]: e.target.value }))
                    }
                  />
                )}
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Optional voice note
                  </p>
                  <AudioBlock
                    qid={q.id}
                    recording={recording}
                    onStart={() => startRecording(q.id)}
                    onStop={stopRecording}
                    blob={audioBlobs[q.id]}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-[56px] rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-lg font-semibold text-white shadow-md hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}

function AudioBlock({
  qid,
  recording,
  onStart,
  onStop,
  blob,
}: {
  qid: string;
  recording: string | null;
  onStart: () => void;
  onStop: () => void;
  blob?: Blob;
}) {
  const url = blob ? URL.createObjectURL(blob) : null;
  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {recording === qid ? (
          <button
            type="button"
            className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white"
            onClick={onStop}
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold"
            onClick={onStart}
          >
            Record
          </button>
        )}
      </div>
      {url && (
        <audio
          className="w-full"
          controls
          src={url}
          onLoadedData={() => {
            /* revoke later if needed */
          }}
        />
      )}
    </div>
  );
}
