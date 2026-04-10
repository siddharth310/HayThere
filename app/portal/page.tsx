import Link from "next/link";
import { portalLogout } from "@/app/actions/auth";
import { PageIntro } from "@/components/page-intro";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortalHomePage() {
  const surveys = await prisma.survey.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const showLogout = Boolean(process.env.PORTAL_PASSWORD);

  return (
    <>
      <PageIntro
        eyebrow="Command center"
        title="Surveys"
        description="Create, publish, and review voice responses. Same flow for every industry you deploy."
        actions={
          <>
            {showLogout ? (
              <form action={portalLogout}>
                <button
                  type="submit"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Sign out
                </button>
              </form>
            ) : null}
            <Link
              href="/portal/surveys/new"
              className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
            >
              New survey
            </Link>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/90 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Survey</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Responses</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {surveys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  No surveys yet.{" "}
                  <Link
                    href="/portal/surveys/new"
                    className="font-semibold text-sky-600 underline"
                  >
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              surveys.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-100 last:border-0 odd:bg-white/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/portal/surveys/${s.id}/edit`}
                      className="font-semibold text-slate-900 hover:text-sky-700 hover:underline"
                    >
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {s.status === "PUBLISHED" ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/portal/surveys/${s.id}/responses`}
                      className="font-semibold text-sky-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {s.slug}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.updatedAt.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
