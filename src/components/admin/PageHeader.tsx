export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-headline font-bold text-3xl text-primary">{title}</h1>
      {subtitle && <p className="text-on-surface-variant mt-1">{subtitle}</p>}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-label text-[11px] tracking-[0.2em] uppercase text-secondary mb-4 mt-10">
      {children}
    </h2>
  );
}
