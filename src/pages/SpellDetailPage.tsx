import { useParams } from "react-router";
import { ApiError } from "../api/client";
import { DetailPageHeader } from "../components/DetailPageHeader";
import { DetailSection } from "../components/DetailSection";
import { NotFoundState } from "../components/NotFoundState";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import { useSpell } from "../hooks/useSpell";

function formatLevel(level: number) {
  return level === 0 ? "Cantrip" : `Level ${level}`;
}

export function SpellDetailPage() {
  const { id } = useParams();
  const spellId = Number(id);
  const { data: spell, isLoading, error } = useSpell(spellId);

  if (!Number.isFinite(spellId)) {
    return (
      <NotFoundState
        title="Spell not found"
        description={`No spell exists for id: ${id}`}
        backTo={ROUTES.spells}
        backLabel="Back to spells"
      />
    );
  }

  if (isLoading) {
    return (
      <Surface as="section" className="p-8 text-center">
        <p className="text-slate-700 dark:text-zinc-300">Loading spell...</p>
      </Surface>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Spell not found"
        description={`No spell exists for id: ${id}`}
        backTo={ROUTES.spells}
        backLabel="Back to spells"
      />
    );
  }

  if (error) {
    return (
      <Surface as="section" className="p-8 text-center">
        <p className="text-slate-700 dark:text-zinc-300">{error.message}</p>
      </Surface>
    );
  }

  if (!spell) {
    return (
      <NotFoundState
        title="Spell not found"
        description={`No spell exists for id: ${id}`}
        backTo={ROUTES.spells}
        backLabel="Back to spells"
      />
    );
  }

  return (
    <section className="space-y-6">
      <DetailPageHeader
        backTo={ROUTES.spells}
        backLabel="Back to spells"
        title={spell.name}
        subtitle={`${formatLevel(spell.level)} · ${spell.school}`}
      />

      <DetailSection title="Overview">
        <dl className="grid grid-cols-1 gap-3 text-sm text-slate-700 dark:text-zinc-300 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500 dark:text-zinc-400">
              Casting Time
            </dt>
            <dd>{spell.casting_time}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-zinc-400">
              Range
            </dt>
            <dd>{spell.range}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-zinc-400">
              Duration
            </dt>
            <dd>{spell.duration}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 dark:text-zinc-400">
              Components
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {spell.components.map((c) => (
                <span
                  key={c}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-zinc-700 dark:text-zinc-200"
                >
                  {c}
                </span>
              ))}
              {spell.concentration ? (
                <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  Concentration
                </span>
              ) : null}
              {spell.ritual ? (
                <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                  Ritual
                </span>
              ) : null}
            </dd>
          </div>
          {spell.material ? (
            <div className="sm:col-span-2">
              <dt className="font-medium text-slate-500 dark:text-zinc-400">
                Material
              </dt>
              <dd>{spell.material}</dd>
            </div>
          ) : null}
        </dl>
      </DetailSection>

      <DetailSection title="Description">
        <p className="whitespace-pre-wrap text-slate-700 dark:text-zinc-300">
          {spell.description}
        </p>
      </DetailSection>

      {spell.higher_levels ? (
        <DetailSection title="At Higher Levels">
          <p className="whitespace-pre-wrap text-slate-700 dark:text-zinc-300">
            {spell.higher_levels}
          </p>
        </DetailSection>
      ) : null}

      <DetailSection title="Available To">
        <div className="flex flex-wrap gap-2">
          {spell.classes.map((cls) => (
            <span
              key={cls}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-zinc-700 dark:text-zinc-200"
            >
              {cls}
            </span>
          ))}
        </div>
      </DetailSection>
    </section>
  );
}
