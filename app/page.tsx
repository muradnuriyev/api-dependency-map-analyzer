import UploadSpecForm from "@/components/UploadSpecForm";
import SpecList from "@/components/SpecList";
import MainLayout from "@/components/Layout/MainLayout";
import PageHeader from "@/components/Layout/PageHeader";
import { prisma } from "@/lib/db";

export default async function Home() {
  const latestSpecs = await prisma.apiSpec.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <MainLayout>
      <PageHeader
        title="API Dependency Map Analyzer"
        description="Parse OpenAPI specs, visualize endpoint ↔ schema relationships, and spot chokepoints before they haunt you in production."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <UploadSpecForm />
        <SpecList specs={latestSpecs} />
      </div>
    </MainLayout>
  );
}
