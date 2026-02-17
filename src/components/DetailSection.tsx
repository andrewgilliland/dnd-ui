import type { ReactNode } from "react";
import { Surface } from "./Surface";

interface DetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DetailSection({
  title,
  children,
  className,
}: DetailSectionProps) {
  return (
    <Surface className={["p-6", className].filter(Boolean).join(" ")}>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </Surface>
  );
}
