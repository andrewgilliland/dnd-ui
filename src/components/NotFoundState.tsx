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
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{description}</p>
      <Link
        to={backTo}
        className="mt-4 inline-flex text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-200"
      >
        {backLabel}
      </Link>
    </Surface>
  );
}
