"use client";

import { useMemo, useState } from "react";
import { ApiEndpoint } from "@/lib/openapi/types";

interface EndpointListProps {
  endpoints: ApiEndpoint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export default function EndpointList({ endpoints, selectedId, onSelect }: EndpointListProps) {
  // Local UI state for search and tag filters.
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Gather distinct tags to render chips.
  const tags = useMemo(() => {
    const all = new Set<string>();
    endpoints.forEach((ep) => ep.tags.forEach((tag) => all.add(tag)));
    return Array.from(all).sort();
  }, [endpoints]);

  // Filter endpoints based on search text and tag selection.
  const filtered = useMemo(() => {
    return endpoints.filter((endpoint) => {
      const matchesSearch =
        endpoint.path.toLowerCase().includes(search.toLowerCase()) ||
        endpoint.summary?.toLowerCase().includes(search.toLowerCase()) ||
        endpoint.method.toLowerCase().includes(search.toLowerCase());
      const matchesTag = !tagFilter || endpoint.tags.includes(tagFilter);
      return matchesSearch && matchesTag;
    });
  }, [endpoints, search, tagFilter]);

  return (
    <div className="card p-4 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">Endpoints</h3>
          <p className="text-xs muted">
            {filtered.length} / {endpoints.length} shown
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <input
          placeholder="Search by path, method, or summary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-surface bg-surface-muted px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/60"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTagFilter(null)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              !tagFilter
                ? "border-accent bg-accent-soft text-foreground shadow-[0_6px_16px_-10px_var(--accent)]"
                : "border-surface bg-surface-muted text-foreground hover-border-accent hover-text-accent"
            }`}
          >
            All tags
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTagFilter(tag === tagFilter ? null : tag)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                tag === tagFilter
                  ? "border-accent bg-accent-soft text-foreground shadow-[0_6px_16px_-10px_var(--accent)]"
                  : "border-surface bg-surface-muted text-foreground hover-border-accent hover-text-accent"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {filtered.map((endpoint) => (
          <button
            type="button"
            key={endpoint.id}
            onClick={() => onSelect?.(endpoint.id)}
            className={`w-full rounded-xl border px-3 py-2 text-left transition ${
              endpoint.id === selectedId
                ? "border-accent bg-accent-soft shadow-[0_10px_26px_-18px_var(--accent)]"
                : "border-surface bg-surface-muted hover-border-accent"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-accent/50 bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
                {endpoint.method}
              </span>
              <span className="text-sm font-semibold text-foreground">{endpoint.path}</span>
            </div>
            {endpoint.summary ? (
              <p className="mt-1 line-clamp-2 text-xs muted">{endpoint.summary}</p>
            ) : null}
          </button>
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm muted">No endpoints match your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
