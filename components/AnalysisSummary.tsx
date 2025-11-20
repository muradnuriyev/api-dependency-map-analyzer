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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Analysis summary</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        <li>
          • {metrics.endpointCount} endpoints across {primaryTags.length || "0"} tag groups.
        </li>
        <li>
          • Central schemas:{" "}
          {mostUsed.length > 0 ? mostUsed.join(", ") : "no shared schemas detected yet."}
        </li>
        <li>
          • Average of {metrics.avgSchemasPerEndpoint} schemas per endpoint suggests{" "}
          {metrics.avgSchemasPerEndpoint > 3 ? "tight coupling" : "lean payloads"}.
        </li>
        <li>
          • {model.schemas.length} schemas defined; peak complexity{" "}
          {Math.max(...model.schemas.map((s) => s.complexityScore), 0)}.
        </li>
      </ul>
    </div>
  );
}
