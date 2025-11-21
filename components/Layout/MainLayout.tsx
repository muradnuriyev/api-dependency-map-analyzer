interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const year = new Date().getFullYear();

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-[-14%] top-[-18%] h-80 w-80 rounded-full bg-accent-soft blur-3xl opacity-50"
          aria-hidden
        />
        <div
          className="absolute right-[-12%] bottom-[-20%] h-96 w-96 rounded-full bg-accent-soft blur-3xl opacity-40"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_srgb,var(--surface-muted)_40%,transparent)] via-transparent to-[color-mix(in_srgb,var(--surface-muted)_24%,transparent)] opacity-80"
          aria-hidden
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 text-foreground">
          {children}

          <footer className="mt-8 border-t border-surface pt-6 text-sm text-center text-foreground">
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-muted px-4 py-2 text-foreground shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden />
              © {year} Murad Nuriyev. All rights reserved.
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
