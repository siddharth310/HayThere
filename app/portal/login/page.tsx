import Link from "next/link";
import { portalLogin } from "@/app/actions/auth";

export default function PortalLoginPage() {
  if (!process.env.PORTAL_PASSWORD) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/80 bg-white/90 p-8 shadow-xl">
        <p className="text-slate-600">
          Portal login is disabled (set{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">
            PORTAL_PASSWORD
          </code>{" "}
          to require a password).
        </p>
        <Link
          href="/portal"
          className="mt-6 inline-block font-semibold text-sky-600 underline"
        >
          Continue to portal
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="rounded-2xl border border-white/80 bg-white/90 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          HayThere · Portal
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use the password from{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">
            PORTAL_PASSWORD
          </code>{" "}
          in your <code className="text-slate-800">.env</code>.
        </p>
        <form action={portalLogin} className="mt-6 flex flex-col gap-4">
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-sky-400/30 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 py-3 font-semibold text-white shadow-md transition hover:brightness-105"
          >
            Sign in
          </button>
        </form>
      </div>
      <Link
        href="/"
        className="text-center text-sm font-semibold text-sky-700 hover:underline"
      >
        ← Marketing home
      </Link>
    </div>
  );
}
