import { Surface } from "./Surface";

export function ListCardSkeleton() {
  return (
    <Surface className="animate-pulse p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-6 w-12 rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="mt-3 space-y-2">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="mt-4 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
    </Surface>
  );
}
