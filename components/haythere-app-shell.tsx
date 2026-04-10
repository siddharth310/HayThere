import Link from "next/link";
import { HayThereAppNav } from "@/components/haythere-app-nav";

export function HayThereAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="haythere-app min-h-screen bg-gradient-to-br from-sky-50 via-amber-50/70 to-emerald-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl outline-offset-4 transition hover:opacity-90"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500 text-sm font-black text-white shadow-md shadow-amber-500/25">
                H
              </span>
              <span className="font-bold tracking-tight text-slate-900">
                HayThere
              </span>
            </Link>
            <HayThereAppNav />
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-sky-700 underline-offset-4 hover:underline"
          >
            Marketing home
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
