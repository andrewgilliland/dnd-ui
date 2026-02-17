import { NavLink, Outlet } from "react-router";
import { ROUTES } from "../constants/routes";
import { ThemeToggle } from "./ThemeToggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
  ].join(" ");

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            D&D Compendium
          </h1>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2">
              <NavLink to={ROUTES.characters} className={navLinkClass}>
                Characters
              </NavLink>
              <NavLink to={ROUTES.items} className={navLinkClass}>
                Items
              </NavLink>
              <NavLink to={ROUTES.monsters} className={navLinkClass}>
                Monsters
              </NavLink>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
