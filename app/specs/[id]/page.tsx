import MainLayout from "@/components/Layout/MainLayout";
import PageHeader from "@/components/Layout/PageHeader";
import SpecAnalysisView from "@/components/SpecAnalysisView";
import { prisma } from "@/lib/db";
import { calculateApiMetrics } from "@/lib/openapi/calculateMetrics";
import { buildDependencyGraph } from "@/lib/openapi/analyzeDependencies";
import { parseOpenApiSpec } from "@/lib/openapi/parseSpec";
import { InvalidSpecError } from "@/lib/errors";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SpecPageProps {
  params: Promise<{ id: string }>;
}

export default async function SpecPage({ params }: SpecPageProps) {
  // Dynamic params are a Promise in RSC; unwrap before use.
  const { id } = await params;
  const spec = await prisma.apiSpec.findUnique({ where: { id } });

  if (!spec) {
    notFound();
  }

  // Prepare analysis outputs or a friendly error message.
  let errorMessage: string | null = null;
  let parsedModel: ReturnType<typeof parseOpenApiSpec> | null = null;
  let graph: ReturnType<typeof buildDependencyGraph> | null = null;
  let metrics: ReturnType<typeof calculateApiMetrics> | null = null;

  try {
    parsedModel = parseOpenApiSpec(spec.raw);
    graph = buildDependencyGraph(parsedModel);
    metrics = calculateApiMetrics(parsedModel);
  } catch (error) {
    errorMessage =
      error instanceof InvalidSpecError
        ? error.message
        : "Failed to parse or analyze this specification.";
  }

  return (
    <MainLayout>
      <PageHeader
        title={spec.name}
        description={`Uploaded ${new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(spec.createdAt)}`}
        actions={
          <Link
            href="/"
            className="btn-ghost text-sm font-semibold hover-text-accent"
          >
            Upload another
          </Link>
        }
      />

      <div className="mt-6 space-y-4">
        {errorMessage ? (
          <div className="rounded-xl border border-rose-400/60 bg-[color-mix(in_srgb,#f43f5e_16%,transparent)] p-4 text-foreground shadow-lg">
            <p className="font-semibold text-foreground">Unable to analyze this spec</p>
            <p className="text-sm text-foreground">{errorMessage}</p>
          </div>
        ) : parsedModel && graph && metrics ? (
          <SpecAnalysisView model={parsedModel} graph={graph} metrics={metrics} />
        ) : null}
      </div>
    </MainLayout>
  );
}
