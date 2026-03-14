import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const THEME_OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

export function ThemeToggle() {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
      <span>Theme</span>
      <div
        role="radiogroup"
        aria-label="Theme mode"
        className="inline-flex rounded-md border border-zinc-300 bg-white p-1 dark:border-zinc-600 dark:bg-zinc-800"
      >
        {THEME_OPTIONS.map((option) => {
          const isActive = themeMode === option.value;
          const Icon = option.Icon;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setThemeMode(option.value)}
              className={[
                "inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700",
              ].join(" ")}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
