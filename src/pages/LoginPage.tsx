import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, Link, Navigate } from "react-router";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? ROUTES.home;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return (
    <Surface
      as="div"
      className="rounded-lg border border-slate-300 bg-white p-6 shadow-xs md:p-8 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <h1 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-50">
        Sign in
      </h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label
            htmlFor="email"
            className="mb-2 inline-block text-sm font-medium text-slate-900 dark:text-slate-50"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-white px-3 py-2.5 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-neutral-700 dark:text-slate-50 dark:outline-neutral-600"
            placeholder="john@readymadeui.com"
          />
        </div>

        <div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 inline-block text-sm font-medium text-slate-900 dark:text-slate-50"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-white px-3 py-2.5 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-neutral-700 dark:text-slate-50 dark:outline-neutral-600"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start flex-wrap gap-2 pt-4">
            <label className="group flex items-center has-[input:checked]:text-slate-900 dark:has-[input:checked]:text-slate-100">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="peer sr-only"
              />
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-white outline-1 outline-slate-300 transition peer-checked:bg-blue-600 peer-checked:outline-blue-600 group-focus-within:outline-2 group-focus-within:outline-blue-600 dark:bg-neutral-700 dark:outline-neutral-600"
                aria-hidden="true"
              >
                <svg
                  className="size-3 text-white opacity-0 transition peer-checked:opacity-100"
                  viewBox="0 0 12 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 5l3 3 7-7" />
                </svg>
              </span>
              <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                Remember me
              </span>
            </label>
            <Link
              to={ROUTES.forgotPassword}
              className="ml-auto rounded text-sm font-medium text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-md border border-blue-600 bg-blue-600 px-3.5 py-2 text-sm font-semibold tracking-wide text-white transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <div className="text-center text-sm text-slate-900 dark:text-slate-50">
          Don't have an account?
          <Link
            to={ROUTES.signUp}
            className="ml-1 rounded font-medium text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-500"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Surface>
  );
}
