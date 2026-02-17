import { Link } from "react-router";
import { Surface } from "./Surface";

interface NotFoundStateProps {
  title: string;
  description: string;
  backTo: string;
  backLabel: string;
}

export function NotFoundState({
  title,
  description,
  backTo,
  backLabel,
}: NotFoundStateProps) {
  return (
    <Surface as="section" className="p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
      <Link
        to={backTo}
        className="mt-4 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-slate-100 dark:decoration-slate-600 dark:hover:decoration-slate-200"
      >
        {backLabel}
      </Link>
    </Surface>
  );
}
