interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  // Header with optional description and action slot (e.g., buttons/links).
  return (
    <div className="flex flex-col gap-4 border-b border-surface pb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          <span className="bg-gradient-to-r from-[var(--accent)] via-[color-mix(in srgb,var(--accent) 70%,var(--foreground))] to-[var(--foreground)] bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-base muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
