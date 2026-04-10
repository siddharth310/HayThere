import { PageIntro } from "@/components/page-intro";
import { SurveyEditor } from "@/components/survey-editor";

export default function NewSurveyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Portal"
        title="New survey"
        description="Add questions in English. Publish to generate translations and question audio for field languages."
        backHref="/portal"
        backLabel="All surveys"
      />
      <div className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-8">
        <SurveyEditor mode="create" />
      </div>
    </>
  );
}
