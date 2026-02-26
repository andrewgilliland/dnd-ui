import { Outlet } from "react-router";
import { ThemeToggle } from "./ThemeToggle";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <span className="text-lg font-semibold tracking-tight">
          D&amp;D Compendium
        </span>
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
