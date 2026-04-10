"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkBase =
  "rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5";

export function HayThereAppNav() {
  const pathname = usePathname();
  const portalActive = pathname.startsWith("/portal");
  const fieldActive = pathname.startsWith("/field");

  return (
    <nav
      className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-sm"
      aria-label="App areas"
    >
      <Link
        href="/portal"
        className={`${linkBase} ${
          portalActive
            ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Portal
      </Link>
      <Link
        href="/field"
        className={`${linkBase} ${
          fieldActive
            ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Field
      </Link>
    </nav>
  );
}
