import type { ReactNode } from "react";
import { BackLink } from "./BackLink";

interface DetailPageHeaderProps {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle: ReactNode;
}

export function DetailPageHeader({
  backTo,
  backLabel,
  title,
  subtitle,
}: DetailPageHeaderProps) {
  return (
    <header>
      <BackLink to={backTo}>{backLabel}</BackLink>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-1 text-slate-600 dark:text-slate-400">{subtitle}</p>
    </header>
  );
}
