import { FieldHomeTabs } from "@/components/field-home-tabs";
import { PageIntro } from "@/components/page-intro";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function FieldHomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const activeTab = sp.tab === "training" ? "training" : "surveys";

  const surveys = await prisma.survey.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, slug: true, title: true },
  });

  return (
    <>
      <PageIntro
        eyebrow="Field capture"
        title="Field app"
        description="Open Surveys to pick a form and set question language, or go to Training for videos. Training language is not configurable yet. Large touch targets for the field."
      />
      <FieldHomeTabs activeTab={activeTab} surveys={surveys} />
    </>
  );
}
