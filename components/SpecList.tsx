import Link from "next/link";

interface SpecListProps {
  specs: { id: string; name: string; createdAt: Date }[];
}

export default function SpecList({ specs }: SpecListProps) {
  // Lists a handful of recently saved specs with links.
  return (
    <div className="card p-6 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent specs</h3>
          <p className="text-sm muted">Latest uploads stored locally.</p>
        </div>
        <Link
          href="/samples/petstore.json"
          className="text-sm font-medium text-accent transition hover:opacity-80"
        >
          Download sample
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {specs.length === 0 ? (
          <p className="text-sm muted">No specs yet. Upload your first one!</p>
        ) : (
          specs.map((spec) => (
            <Link
              key={spec.id}
              href={`/specs/${spec.id}`}
              className="flex items-center justify-between rounded-xl border border-surface bg-surface-muted px-3 py-2 transition hover-border-accent hover-bg-accent-soft"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{spec.name}</p>
                <p className="text-xs muted">
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(spec.createdAt)}
                </p>
              </div>
              <span className="text-xs font-semibold text-accent">View</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
