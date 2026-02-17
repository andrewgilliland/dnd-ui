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
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-1 text-slate-600">{subtitle}</p>
    </header>
  );
}
