import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router";
import {
  Menu,
  Package,
  Settings,
  Skull,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

const navLinks = [
  { to: ROUTES.characters, label: "Characters", Icon: Users },
  { to: ROUTES.items, label: "Items", Icon: Package },
  { to: ROUTES.monsters, label: "Monsters", Icon: Skull },
  { to: ROUTES.spells, label: "Spells", Icon: Sparkles },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
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
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            D&D Compendium
          </h1>

          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.settings}
              aria-label="Settings"
              className="group rounded-md border border-zinc-300 bg-white p-2.5 text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <Settings
                aria-hidden="true"
                className="h-4 w-4 transform transition-transform duration-200 ease-in-out group-hover:rotate-90"
              />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 sm:block"
            >
              Sign Out
            </button>
            <button
              type="button"
              className="rounded-md border border-zinc-300 bg-white p-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 sm:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() =>
                setIsMobileMenuOpen((currentValue) => !currentValue)
              }
            >
              {isMobileMenuOpen ? (
                <X aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Menu aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <nav className="mt-3 hidden flex-wrap items-center gap-2 sm:flex">
          {navLinks.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <span className="inline-flex items-center gap-1.5">
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </span>
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
          {navLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </span>
            </NavLink>
          ))}
          <div className="mt-1 flex items-center justify-between border-t border-zinc-200 pt-2 dark:border-zinc-700">
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
