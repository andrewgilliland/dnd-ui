import type { ReactNode } from "react";
import { Link } from "react-router";

interface BackLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

const baseClassName =
  "text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4";

export function BackLink({ to, children, className }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={[baseClassName, className].filter(Boolean).join(" ")}
    >
      {children}
    </Link>
  );
}
