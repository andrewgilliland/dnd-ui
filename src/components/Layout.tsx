import { NavLink, Outlet } from "react-router";
import { ROUTES } from "../constants/routes";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            D&D Compendium
          </h1>
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
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
