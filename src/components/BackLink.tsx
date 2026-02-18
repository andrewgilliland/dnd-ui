import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

interface BackLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

const baseClassName =
  "inline-flex items-center gap-1 text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-200";

export function BackLink({ to, children, className }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={[baseClassName, className].filter(Boolean).join(" ")}
    >
      <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
      {children}
    </Link>
  );
}
