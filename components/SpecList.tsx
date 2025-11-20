import Link from "next/link";

interface SpecListProps {
  specs: { id: string; name: string; createdAt: Date }[];
}

export default function SpecList({ specs }: SpecListProps) {
  // Lists a handful of recently saved specs with links.
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recent specs</h3>
          <p className="text-sm text-slate-600">Latest uploads stored locally.</p>
        </div>
        <Link
          href="/samples/petstore.json"
          className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
        >
          Download sample
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {specs.length === 0 ? (
          <p className="text-sm text-slate-600">No specs yet. Upload your first one!</p>
        ) : (
          specs.map((spec) => (
            <Link
              key={spec.id}
              href={`/specs/${spec.id}`}
              className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 transition hover:border-indigo-100 hover:bg-indigo-50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{spec.name}</p>
                <p className="text-xs text-slate-600">
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(spec.createdAt)}
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600">View</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
