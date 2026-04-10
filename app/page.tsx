import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-amber-50 to-emerald-100 text-slate-900">
      <div
        className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-40 h-96 w-96 rounded-full bg-sky-300/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-200/40 blur-3xl"
        aria-hidden
      />

      <header className="relative z-10 border-b border-white/40 bg-white/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 text-lg font-black text-white shadow-lg shadow-amber-500/30"
              aria-hidden
            >
              H
            </span>
            <div>
              <p className="font-sans text-lg font-bold tracking-tight text-slate-900">
                HayThere
              </p>
              <p className="text-xs font-medium text-slate-500">
                Voice in · structured truth out
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/portal"
              className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-800"
            >
              Portal
            </Link>
            <Link
              href="/field"
              className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:brightness-105"
            >
              Field app
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
        <section className="text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-600 shadow-sm backdrop-blur">
            <span className="text-lg" aria-hidden>
              🌾
            </span>
            Field data that actually listens
          </p>
          <h1 className="mt-6 font-sans text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Say{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              HayThere
            </span>{" "}
            to better data
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            The slightly punny name is on purpose: it’s the sound of walking into a{" "}
            <em className="text-emerald-700 not-italic">field</em> and the friendly{" "}
            <em className="text-sky-700 not-italic">hey there</em> you’d say to a farmer,
            nurse, or inspector before the clipboard steals the moment. We keep the
            human, capture the voice, and ship the spreadsheet.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/field"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-base font-semibold text-white shadow-xl transition hover:bg-slate-800"
            >
              Start in the field
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center justify-center rounded-full border-2 border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-800 transition hover:border-slate-300"
            >
              Command center
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          <StoryCard
            emoji="🚜"
            title="Why “Hay”?"
            body="A nod to soil, crops, and the places Wi‑Fi forgets. If your work has mud, sun, or a stethoscope in the sun—we’re built for that kind of honest."
            accent="from-amber-100 to-orange-50 border-amber-200/80"
          />
          <StoryCard
            emoji="👋"
            title="Why “There”?"
            body="Because truth lives where your executives stand—not where the dashboard wishes they were. We meet people in the moment with voice, not typing drills."
            accent="from-sky-100 to-cyan-50 border-sky-200/80"
          />
          <StoryCard
            emoji="🎙️"
            title="Why voice?"
            body="Hands are full. Languages vary. Typos don’t. Voice → text → English → structured fields, with audio proof when auditors ask awkward questions."
            accent="from-violet-100 to-fuchsia-50 border-violet-200/80"
          />
        </section>

        <section className="mt-16 rounded-[2rem] border border-sky-200/70 bg-white/75 p-8 shadow-lg backdrop-blur md:p-10">
          <h2 className="text-center font-sans text-xl font-bold text-slate-900 sm:text-2xl">
            Why &ldquo;HayThere&rdquo;? The serious answer.
          </h2>
          <ul className="mx-auto mt-8 max-w-3xl list-none space-y-5 text-left text-slate-700">
            <li className="flex gap-3">
              <span className="mt-0.5 font-bold text-sky-600">1.</span>
              <span>
                <strong className="text-slate-900">It’s a greeting, not a product code.</strong>{" "}
                Field executives don’t fall in love with “Enterprise Data Capture™”—they
                remember the human moment before the form. HayThere sounds like someone
                showed up, not like software billing by the seat.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-bold text-emerald-600">2.</span>
              <span>
                <strong className="text-slate-900">Two meanings, one mission.</strong>{" "}
                <em className="not-italic text-amber-800">Hay</em> ties us to soil, crops,
                and outdoor truth; <em className="not-italic text-sky-800">hey there</em>{" "}
                is what you say in a clinic corridor, a village lane, or a safety walk—same
                product, every sector where “on site” matters.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-bold text-violet-600">3.</span>
              <span>
                <strong className="text-slate-900">It’s sticky (and shareable).</strong>{" "}
                A quirky name travels: your team repeats it in stand-ups, enumerators
                tell the story, and leadership actually remembers what they approved.
                Boring names die in slide decks; this one lives in conversation.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-bold text-rose-600">4.</span>
              <span>
                <strong className="text-slate-900">It matches how we behave.</strong>{" "}
                We’re not here to shout at users—we’re here to listen, transcribe,
                translate, and structure what they said, with receipts. The name is a
                little wink; the pipeline is dead serious.
              </span>
            </li>
          </ul>
        </section>

        <section className="mt-24">
          <h2 className="text-center font-sans text-2xl font-bold text-slate-900 sm:text-3xl">
            Built where boots (and scrubs) hit the ground
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Same platform, different worlds—capture, validate, and prove what happened
            on site.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <IndustryCard
              title="Agriculture & cooperatives"
              desc="Plots, yields, training visits, and last‑mile verification—spoken in local languages, aligned to analytics."
              color="bg-emerald-400/90"
            />
            <IndustryCard
              title="Healthcare & community health"
              desc="Screenings, follow‑ups, and household surveys where typing is slow and accuracy is everything."
              color="bg-rose-400/90"
            />
            <IndustryCard
              title="Public programs & audits"
              desc="Scheme rollouts, compliance checks, and field audits with an evidence trail that hums."
              color="bg-sky-400/90"
            />
            <IndustryCard
              title="Infrastructure & utilities"
              desc="Site inspections, safety rounds, and asset checks—structured outputs without the clipboard acrobatics."
              color="bg-amber-400/90"
            />
            <IndustryCard
              title="Research & social impact"
              desc="Longitudinal studies and baseline surveys where participants speak, researchers get clean JSON."
              color="bg-violet-400/90"
            />
            <IndustryCard
              title="…and whatever you send into the wild"
              desc="If someone’s job title includes “field,” “territory,” or “last mile,” you’re probably our people."
              color="bg-slate-700/90"
            />
          </div>
        </section>

        <section className="mt-24 grid gap-8 rounded-[2rem] border border-white/60 bg-white/60 p-8 shadow-xl shadow-slate-200/50 backdrop-blur md:grid-cols-2 md:p-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
              Vision
            </p>
            <h3 className="mt-2 font-sans text-2xl font-bold text-slate-900">
              Every field voice, audit‑ready
            </h3>
            <p className="mt-4 leading-relaxed text-slate-600">
              We see a world where the hardest‑to‑reach answers are the easiest to
              trust—because they’re heard, transcribed, translated, and stored with the
              warmth of the original moment and the rigor HQ demands.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Mission
            </p>
            <h3 className="mt-2 font-sans text-2xl font-bold text-slate-900">
              Less typing. More truth.
            </h3>
            <p className="mt-4 leading-relaxed text-slate-600">
              HayThere arms field executives with voice‑first capture, multi‑language
              playback, and structured extraction—so validation isn’t a weekend cleanup
              job, and leadership can sleep knowing the field actually said what the
              field said.
            </p>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 px-8 py-12 text-center text-white shadow-2xl sm:px-12">
          <h2 className="font-sans text-2xl font-bold sm:text-3xl">
            Ready to sound like you mean it?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Spin up surveys in the portal, publish with translations, then let your
            teams answer in the field app—voices in, structured data out.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/portal/surveys/new"
              className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Create a survey
            </Link>
            <Link
              href="/field"
              className="rounded-full border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Open field app
            </Link>
          </div>
        </section>

        <footer className="mt-16 border-t border-slate-200/80 pt-8 text-center text-sm text-slate-500">
          <p className="font-semibold text-slate-700">HayThere</p>
          <p className="mt-1">
            Voice‑first surveys · Translation · Structured responses · Audio you can
            stand behind
          </p>
        </footer>
      </main>
    </div>
  );
}

function StoryCard({
  emoji,
  title,
  body,
  accent,
}: {
  emoji: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <article
      className={`rounded-3xl border bg-gradient-to-br p-6 shadow-md backdrop-blur ${accent}`}
    >
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="mt-3 font-sans text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{body}</p>
    </article>
  );
}

function IndustryCard({
  title,
  desc,
  color,
}: {
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <article className="flex gap-4 rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-md">
      <div
        className={`h-12 w-1 shrink-0 rounded-full ${color}`}
        aria-hidden
      />
      <div>
        <h3 className="font-sans font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</p>
      </div>
    </article>
  );
}
