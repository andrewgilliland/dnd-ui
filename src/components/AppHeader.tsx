import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { to: ROUTES.characters, label: "Characters" },
  { to: ROUTES.items, label: "Items" },
  { to: ROUTES.monsters, label: "Monsters" },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
  ].join(" ");

export function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            D&D Compendium
          </h1>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:block"
            >
              Sign Out
            </button>
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
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <nav
          id="mobile-navigation"
          className={[
            "mt-3 flex flex-col gap-2 sm:hidden",
            isMobileMenuOpen ? "" : "hidden",
          ].join(" ")}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
