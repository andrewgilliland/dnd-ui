import type { ElementType, ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

const baseClassName =
  "rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";

export function Surface({
  children,
  className,
  as: Component = "article",
}: SurfaceProps) {
  return (
    <Component className={[baseClassName, className].filter(Boolean).join(" ")}>
      {children}
    </Component>
  );
}
