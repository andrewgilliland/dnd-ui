import { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ThemeToggle } from "../components/ThemeToggle";

interface UserAttributes {
  email?: string;
  email_verified?: string;
  sub?: string;
}

export function SettingsPage() {
  const { user } = useAuth();
  const [attributes, setAttributes] = useState<UserAttributes | null>(null);

  useEffect(() => {
    fetchUserAttributes()
      .then((attrs) => setAttributes(attrs as UserAttributes))
      .catch(() => setAttributes({}));
  }, []);

  return (
    <section>
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />

      <div className="mt-6 space-y-4">
        <Surface as="section" className="p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <User aria-hidden="true" className="h-4 w-4" />
            Account
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {attributes === null ? (
                  <span className="text-zinc-400 dark:text-zinc-500">Loading...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    {attributes.email ?? "—"}
                    {attributes.email_verified === "true" && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Verified
                      </span>
                    )}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">Username</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {user?.username ?? "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">User ID</dt>
              <dd className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {attributes === null ? (
                  <span className="text-zinc-400 dark:text-zinc-500">Loading...</span>
                ) : (
                  attributes.sub ?? "—"
                )}
              </dd>
            </div>
          </dl>
        </Surface>

        <Surface as="section" className="p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Appearance
          </h2>
          <ThemeToggle />
        </Surface>
      </div>
    </section>
  );
}
