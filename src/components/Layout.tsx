import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              D&D Compendium
            </h1>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:hidden"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() =>
                  setIsMobileMenuOpen((currentValue) => !currentValue)
                }
              >
                {isMobileMenuOpen ? "Close" : "Menu"}
              </button>
            </div>
          </div>

          <nav className="mt-3 hidden flex-wrap items-center gap-2 sm:flex">
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

          <nav
            id="mobile-navigation"
            className={[
              "mt-3 flex flex-col gap-2 sm:hidden",
              isMobileMenuOpen ? "" : "hidden",
            ].join(" ")}
          >
            <NavLink
              to={ROUTES.characters}
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Characters
            </NavLink>
            <NavLink
              to={ROUTES.items}
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Items
            </NavLink>
            <NavLink
              to={ROUTES.monsters}
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Monsters
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
