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
      <div className="card p-4 shadow-lg">
        <p className="text-sm muted">Select an endpoint to see details.</p>
      </div>
    );
  }

  const schemaLookup = new Map(schemas.map((schema) => [schema.name, schema]));

  // Helper to render request/response schema lists with complexity badge.
  const renderSchemas = (items: { name: string }[], label: string) => (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide muted">{label}</h4>
      {items.length === 0 ? (
        <p className="text-sm muted">None</p>
      ) : (
        <ul className="mt-1 space-y-1 text-sm text-foreground">
          {items.map((schema) => (
            <li
              key={schema.name}
              className="flex items-center justify-between rounded-lg border border-surface bg-surface-muted px-2 py-1"
            >
              <span>{schema.name}</span>
              <span className="text-xs muted">
                complexity {schemaLookup.get(schema.name)?.complexityScore ?? "-"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="card p-4 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground transition">
          {endpoint.method}
        </span>
        <h3 className="text-lg font-semibold text-foreground">{endpoint.path}</h3>
      </div>
      {endpoint.summary ? <p className="mt-1 text-sm text-foreground">{endpoint.summary}</p> : null}
      {endpoint.description ? (
        <p className="mt-1 text-sm muted">{endpoint.description}</p>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {renderSchemas(endpoint.requestSchemas, "Request schemas")}
        {renderSchemas(endpoint.responseSchemas, "Response schemas")}
      </div>

      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide muted">Status codes</h4>
        {endpoint.statusCodes.length === 0 ? (
          <p className="text-sm muted">None declared</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {endpoint.statusCodes.map((code) => (
              <span
                key={code}
                className="rounded-full border border-surface bg-surface-muted px-2 py-1 text-xs font-semibold text-foreground"
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
