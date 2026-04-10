import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
};

/** Shared title block for portal & field (aligned UX). */
export function PageIntro({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  actions,
}: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {backHref && backLabel ? (
          <Link
            href={backHref}
            className="text-xs font-bold uppercase tracking-widest text-sky-700 transition hover:text-sky-900"
          >
            ← {backLabel}
          </Link>
        ) : null}
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
