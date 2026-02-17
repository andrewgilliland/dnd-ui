import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Page not found</h2>
      <p className="mt-2 text-slate-600">
        The route you entered does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Back to home
      </Link>
    </section>
  );
}
