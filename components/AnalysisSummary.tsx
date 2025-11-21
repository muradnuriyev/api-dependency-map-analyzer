import { ApiMetrics, ApiSpecDomainModel } from "@/lib/openapi/types";

interface AnalysisSummaryProps {
  model: ApiSpecDomainModel;
  metrics: ApiMetrics;
}

export default function AnalysisSummary({ model, metrics }: AnalysisSummaryProps) {
  const mostUsed = metrics.mostUsedSchemas.slice(0, 3).map((item) => item.schema);
  const primaryTags = metrics.tagDistribution
    .slice(0, 3)
    .map((item) => `${item.tag} (${item.count})`);

  // Lightweight textual summary pulling insights from metrics/model.
  return (
    <div className="card p-4 shadow-lg">
      <h3 className="text-base font-semibold text-foreground">Analysis summary</h3>
      <ul className="mt-3 space-y-2 text-sm text-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-accent" aria-hidden />
          <span>
            {metrics.endpointCount} endpoints across {primaryTags.length || "0"} tag groups.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-accent" aria-hidden />
          <span>
            Central schemas:{" "}
            {mostUsed.length > 0 ? mostUsed.join(", ") : "no shared schemas detected yet."}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-accent" aria-hidden />
          <span>
            Average of {metrics.avgSchemasPerEndpoint} schemas per endpoint suggests{" "}
            {metrics.avgSchemasPerEndpoint > 3 ? "tight coupling" : "lean payloads"}.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-accent" aria-hidden />
          <span>
            {model.schemas.length} schemas defined; peak complexity{" "}
            {Math.max(...model.schemas.map((s) => s.complexityScore), 0)}.
          </span>
        </li>
      </ul>
    </div>
  );
}
