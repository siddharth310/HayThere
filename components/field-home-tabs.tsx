import Link from "next/link";
import {
  TRAINING_VIDEOS,
  trainingEmbedUrl,
  trainingWatchUrl,
} from "@/lib/field-training-videos";

type SurveyListItem = {
  id: string;
  slug: string;
  title: string;
};

type TabId = "surveys" | "training";

const tabClass = (active: boolean) =>
  `min-h-[52px] flex-1 rounded-2xl border px-4 py-3 text-center text-base font-bold transition sm:text-lg ${
    active
      ? "border-sky-400 bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md"
      : "border-slate-200 bg-white text-slate-800 hover:border-sky-200"
  }`;

function fieldTabHref(tab: TabId) {
  if (tab === "training") return "/field?tab=training";
  return "/field";
}

type Props = {
  activeTab: TabId;
  surveys: SurveyListItem[];
};

/**
 * Field home: Surveys vs Training. No language (training is not localized yet;
 * language is chosen inside each survey).
 */
export function FieldHomeTabs({ activeTab, surveys }: Props) {
  return (
    <div className="space-y-8">
      <div
        className="flex flex-col gap-2 sm:flex-row"
        role="tablist"
        aria-label="Field app focus"
      >
        <Link
          href={fieldTabHref("surveys")}
          role="tab"
          aria-selected={activeTab === "surveys"}
          className={tabClass(activeTab === "surveys")}
        >
          Surveys
        </Link>
        <Link
          href={fieldTabHref("training")}
          role="tab"
          aria-selected={activeTab === "training"}
          className={tabClass(activeTab === "training")}
        >
          Training
        </Link>
      </div>

      {activeTab === "surveys" ? (
        <section
          className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur"
          role="tabpanel"
        >
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
                    href={`/field/${s.slug}`}
                    className="flex min-h-[52px] items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 transition hover:border-sky-300 hover:bg-sky-50/80"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section
          className="space-y-6"
          role="tabpanel"
          aria-label="Agricultural training"
        >
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-amber-50/60 p-5 shadow-md backdrop-blur sm:p-6">
            <h2 className="font-sans text-lg font-bold text-slate-900 sm:text-xl">
              Good agricultural practices
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
              Short, trusted explainers for learning sessions. On slow networks, use
              &quot;Open on YouTube&quot; to watch in the YouTube app.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Language for training is not configured yet; videos play as on YouTube.
            </p>
          </div>

          <ul className="space-y-8">
            {TRAINING_VIDEOS.map((v) => (
              <li
                key={v.id}
                className="overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-xl shadow-slate-200/50"
              >
                <div className="aspect-video w-full bg-slate-900/5">
                  <iframe
                    className="h-full w-full"
                    src={trainingEmbedUrl(v.id)}
                    title={v.title}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <div className="space-y-2 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {v.source}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {v.blurb}
                  </p>
                  <a
                    href={trainingWatchUrl(v.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-700 underline-offset-2 hover:underline"
                  >
                    Open on YouTube
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
