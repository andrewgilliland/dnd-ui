interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{subtitle}</p>
    </header>
  );
}
