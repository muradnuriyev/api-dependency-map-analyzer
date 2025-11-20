"use client";

import { useMemo, useState } from "react";
import { ApiEndpoint } from "@/lib/openapi/types";

interface EndpointListProps {
  endpoints: ApiEndpoint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export default function EndpointList({ endpoints, selectedId, onSelect }: EndpointListProps) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const tags = useMemo(() => {
    const all = new Set<string>();
    endpoints.forEach((ep) => ep.tags.forEach((tag) => all.add(tag)));
    return Array.from(all).sort();
  }, [endpoints]);

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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Endpoints</h3>
          <p className="text-xs text-slate-600">
            {filtered.length} / {endpoints.length} shown
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <input
          placeholder="Search by path, method, or summary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTagFilter(null)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              !tagFilter
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
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
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2 overflow-y-auto pr-1 max-h-[520px]">
        {filtered.map((endpoint) => (
          <button
            type="button"
            key={endpoint.id}
            onClick={() => onSelect?.(endpoint.id)}
            className={`w-full rounded-lg border px-3 py-2 text-left transition ${
              endpoint.id === selectedId
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {endpoint.method}
              </span>
              <span className="text-sm font-semibold text-slate-900">{endpoint.path}</span>
            </div>
            {endpoint.summary ? (
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">{endpoint.summary}</p>
            ) : null}
          </button>
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-600">No endpoints match your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
