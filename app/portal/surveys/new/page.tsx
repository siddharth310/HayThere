import { PageIntro } from "@/components/page-intro";
import { SurveyEditor } from "@/components/survey-editor";
import { COCOA_FARMER_BASELINE } from "@/lib/survey-templates/cocoa-farmer-baseline";

export default function NewSurveyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Portal"
        title="New survey"
        description="The cocoa farm & household questionnaire is preloaded (dropdowns for yes/no-style items, text for counts and kg). Adjust prompts, add or remove questions, then save. Publish to generate translations and question audio for field languages."
        backHref="/portal"
        backLabel="All surveys"
      />
      <div className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-8">
        <SurveyEditor
          mode="create"
          initialTitle={COCOA_FARMER_BASELINE.title}
          initialDescription={COCOA_FARMER_BASELINE.description}
          initialQuestions={COCOA_FARMER_BASELINE.questions}
        />
      </div>
    </>
  );
}
