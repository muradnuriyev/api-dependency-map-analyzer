"use client";

import { ApiEndpoint, ApiSchema } from "@/lib/openapi/types";

interface EndpointDetailsProps {
  endpoint: ApiEndpoint | null;
  schemas: ApiSchema[];
}

export default function EndpointDetails({ endpoint, schemas }: EndpointDetailsProps) {
  // Empty state when no endpoint is selected.
  if (!endpoint) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">Select an endpoint to see details.</p>
      </div>
    );
  }

  const schemaLookup = new Map(schemas.map((schema) => [schema.name, schema]));

  // Helper to render request/response schema lists with complexity badge.
  const renderSchemas = (items: { name: string }[], label: string) => (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-slate-600">None</p>
      ) : (
        <ul className="mt-1 space-y-1 text-sm text-slate-800">
          {items.map((schema) => (
            <li key={schema.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1">
              <span>{schema.name}</span>
              <span className="text-xs text-slate-500">
                complexity {schemaLookup.get(schema.name)?.complexityScore ?? "-"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {endpoint.method}
        </span>
        <h3 className="text-lg font-semibold text-slate-900">{endpoint.path}</h3>
      </div>
      {endpoint.summary ? <p className="mt-1 text-sm text-slate-700">{endpoint.summary}</p> : null}
      {endpoint.description ? (
        <p className="mt-1 text-sm text-slate-600">{endpoint.description}</p>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {renderSchemas(endpoint.requestSchemas, "Request schemas")}
        {renderSchemas(endpoint.responseSchemas, "Response schemas")}
      </div>

      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status codes</h4>
        {endpoint.statusCodes.length === 0 ? (
          <p className="text-sm text-slate-600">None declared</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {endpoint.statusCodes.map((code) => (
              <span
                key={code}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800"
              >
                {code}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
