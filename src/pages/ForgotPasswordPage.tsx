import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { Surface } from "../components/Surface";
import { ThemeToggle } from "../components/ThemeToggle";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

type Step = "request" | "confirm";

export function ForgotPasswordPage() {
  const { resetPassword, confirmResetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await confirmResetPassword(email, code, newPassword);
      navigate(ROUTES.login);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="mb-2 text-center text-2xl font-bold">
            Reset Password
          </h1>
          <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {step === "request"
              ? "Enter your email to receive a reset code."
              : "Enter the code sent to your email and your new password."}
          </p>

          <Surface as="div" className="p-6">
            {step === "request" ? (
              <form onSubmit={handleRequest} className="space-y-4">
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

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label
                    htmlFor="code"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Reset Code
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

                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </Surface>

          <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            <Link
              to={ROUTES.login}
              className="font-medium text-slate-900 underline underline-offset-4 dark:text-slate-100"
            >
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
