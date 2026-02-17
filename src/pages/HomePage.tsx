import { Link } from "react-router";
import { PageHeader } from "../components/PageHeader";
import { ROUTES } from "../constants/routes";

const sections = [
  {
    title: "Characters",
    description:
      "Browse adventurers, races, classes, alignments, and ability scores.",
    to: ROUTES.characters,
  },
  {
    title: "Items",
    description:
      "Review weapons, armor, wondrous items, rarity, and properties.",
    to: ROUTES.items,
  },
  {
    title: "Monsters",
    description:
      "Inspect creature stat blocks, senses, actions, and challenge ratings.",
    to: ROUTES.monsters,
  },
];

export function HomePage() {
  return (
    <section>
      <PageHeader
        title="Entity Browser"
        subtitle="Pick a category to explore the data."
      />

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
