import { Link } from "react-router";

const sections = [
  {
    title: "Characters",
    description:
      "Browse adventurers, races, classes, alignments, and ability scores.",
    to: "/characters",
  },
  {
    title: "Items",
    description:
      "Review weapons, armor, wondrous items, rarity, and properties.",
    to: "/items",
  },
  {
    title: "Monsters",
    description:
      "Inspect creature stat blocks, senses, actions, and challenge ratings.",
    to: "/monsters",
  },
];

export function HomePage() {
  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        Entity Browser
      </h2>
      <p className="mt-2 text-slate-600">
        Pick a category to explore the data.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.title}
            to={section.to}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {section.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{section.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
