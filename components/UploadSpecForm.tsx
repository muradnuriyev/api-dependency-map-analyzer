"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface UploadSpecFormProps {
  defaultContent?: string;
}

export default function UploadSpecForm({ defaultContent = "" }: UploadSpecFormProps) {
  // Local state for form controls and error feedback.
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState(defaultContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reads the uploaded JSON/YAML file into the textarea and sets default name.
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setContent(text);
    if (!name) {
      setName(file.name.replace(/\.(json|ya?ml)$/i, ""));
    }
  };

  // Submit handler: validate locally, POST to API, then redirect to spec page.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Please paste or upload an OpenAPI document first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Untitled API", content }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save specification.");
      }

      router.push(`/specs/${payload.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch bundled sample spec from /public and prefill fields.
  const handleLoadSample = async () => {
    setError(null);
    try {
      const res = await fetch("/samples/petstore.json");
      if (!res.ok) throw new Error("Unable to load sample spec.");
      const text = await res.text();
      setContent(text);
      setName("Petstore Sample");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load sample spec.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Upload or paste spec</h3>
          <p className="text-sm text-slate-600">
            Supports OpenAPI/Swagger v3 JSON or YAML.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadSample}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Use sample
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My API"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Specification</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your OpenAPI JSON or YAML here..."
            rows={12}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-200"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input type="file" accept=".json,.yaml,.yml" onChange={handleFileChange} />
            Upload JSON/YAML
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? "Analyzing..." : "Analyze API"}
          </button>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </form>
  );
}
