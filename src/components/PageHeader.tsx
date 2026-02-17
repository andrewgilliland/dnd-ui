interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
    </header>
  );
}
