import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

export function ConfirmSignUpPage() {
  const { confirmSignUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail =
    (location.state as { email?: string } | null)?.email ?? "";

  const [email, setEmail] = useState(prefillEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await confirmSignUp(email, code);
      navigate(ROUTES.login);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold">Confirm Account</h1>
      <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Enter the verification code sent to your email.
      </p>

      <Surface as="div" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
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
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="code"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="123456"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {isSubmitting ? "Confirming..." : "Confirm Account"}
          </button>
        </form>
      </Surface>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Already confirmed?{" "}
        <Link
          to={ROUTES.login}
          className="font-medium text-slate-900 underline underline-offset-4 dark:text-slate-100"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
