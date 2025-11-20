import { ApiMetrics } from "@/lib/openapi/types";

interface MetricsPanelProps {
  metrics: ApiMetrics;
}

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">API metrics</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile label="Endpoints" value={metrics.endpointCount} />
        <MetricTile label="Schemas" value={metrics.schemaCount} />
        <MetricTile label="Avg schemas/endpoint" value={metrics.avgSchemasPerEndpoint} />
        <MetricTile
          label="Top schema usage"
          value={
            metrics.mostUsedSchemas[0]
              ? `${metrics.mostUsedSchemas[0].schema} (${metrics.mostUsedSchemas[0].usageCount})`
              : "n/a"
          }
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Most used schemas
          </h4>
          <div className="mt-2 space-y-1">
            {metrics.mostUsedSchemas.length === 0 ? (
              <p className="text-sm text-slate-600">No shared schemas yet.</p>
            ) : (
              metrics.mostUsedSchemas.map((item) => (
                <div
                  key={item.schema}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-800"
                >
                  <span>{item.schema}</span>
                  <span className="text-xs text-slate-600">{item.usageCount} endpoints</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tag distribution
          </h4>
          <div className="mt-2 space-y-1">
            {metrics.tagDistribution.length === 0 ? (
              <p className="text-sm text-slate-600">No tags provided.</p>
            ) : (
              metrics.tagDistribution.map((item) => (
                <div
                  key={item.tag}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-800"
                >
                  <span>{item.tag}</span>
                  <span className="text-xs text-slate-600">{item.count} endpoints</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
