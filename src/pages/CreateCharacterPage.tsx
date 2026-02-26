import { useEffect, useState, type FormEvent } from "react";
import { Dices } from "lucide-react";
import { useNavigate } from "react-router";
import { createCharacter, getClasses, getRaces } from "../api/client";
import { BackLink } from "../components/BackLink";
import { PageHeader } from "../components/PageHeader";
import { Surface } from "../components/Surface";
import { ROUTES } from "../constants/routes";
import type {
  Alignment,
  CharacterClass,
  CharacterRace,
  CharacterStats,
} from "../types";

const ALIGNMENTS: Alignment[] = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
  "Unaligned",
];

const STAT_FIELDS: { key: keyof CharacterStats; label: string }[] = [
  { key: "strength", label: "Strength" },
  { key: "dexterity", label: "Dexterity" },
  { key: "constitution", label: "Constitution" },
  { key: "intelligence", label: "Intelligence" },
  { key: "wisdom", label: "Wisdom" },
  { key: "charisma", label: "Charisma" },
];

const DEFAULT_STATS: CharacterStats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

// Roll 4d6, drop the lowest — standard D&D 5e method
function rollStat(): number {
  const rolls = Array.from(
    { length: 4 },
    () => Math.floor(Math.random() * 6) + 1,
  );
  rolls.sort((a, b) => a - b);
  return rolls.slice(1).reduce((sum, n) => sum + n, 0);
}

function rollStats(): CharacterStats {
  return {
    strength: rollStat(),
    dexterity: rollStat(),
    constitution: rollStat(),
    intelligence: rollStat(),
    wisdom: rollStat(),
    charisma: rollStat(),
  };
}

const STANDARD_ARRAY: CharacterStats = {
  strength: 15,
  dexterity: 14,
  constitution: 13,
  intelligence: 12,
  wisdom: 10,
  charisma: 8,
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500";

const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

export function CreateCharacterPage() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState<string[]>([]);
  const [races, setRaces] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [race, setRace] = useState<CharacterRace | "">("");
  const [characterClass, setCharacterClass] = useState<CharacterClass | "">("");
  const [alignment, setAlignment] = useState<Alignment | "">("");
  const [description, setDescription] = useState("");
  const [stats, setStats] = useState<CharacterStats>(DEFAULT_STATS);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const loadMetadata = async () => {
      try {
        const [classesRes, racesRes] = await Promise.all([
          getClasses({ signal: abortController.signal }),
          getRaces({ signal: abortController.signal }),
        ]);
        setClasses(classesRes.classes);
        setRaces(racesRes.races);
      } catch {
        // Leave empty — form still works without pre-populated options
      }
    };
    void loadMetadata();
    return () => {
      abortController.abort();
    };
  }, []);

  const handleStatChange = (key: keyof CharacterStats, value: string) => {
    const parsed = parseInt(value, 10);
    setStats((prev) => ({
      ...prev,
      [key]: Number.isNaN(parsed) ? 0 : Math.min(30, Math.max(1, parsed)),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!race || !characterClass || !alignment) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const newCharacter = await createCharacter({
        name,
        race: race as CharacterRace,
        class: characterClass as CharacterClass,
        alignment: alignment as Alignment,
        description,
        stats,
      });
      void navigate(ROUTES.characterDetail(newCharacter.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create character.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <BackLink to={ROUTES.characters} className="mb-6 inline-flex">
        Back to Characters
      </BackLink>

      <PageHeader
        title="Create Character"
        subtitle="Build a new hero or villain for your campaign."
      />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column — core details */}
          <div className="space-y-5 lg:col-span-2">
            <Surface as="div" className="p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Thorin Oakenshield"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="race" className={labelClass}>
                      Race
                    </label>
                    <select
                      id="race"
                      required
                      value={race}
                      onChange={(e) => setRace(e.target.value as CharacterRace)}
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select race…
                      </option>
                      {races.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="class" className={labelClass}>
                      Class
                    </label>
                    <select
                      id="class"
                      required
                      value={characterClass}
                      onChange={(e) =>
                        setCharacterClass(e.target.value as CharacterClass)
                      }
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select class…
                      </option>
                      {classes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="alignment" className={labelClass}>
                    Alignment
                  </label>
                  <select
                    id="alignment"
                    required
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value as Alignment)}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select alignment…
                    </option>
                    {ALIGNMENTS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                    placeholder="A brief backstory or description…"
                  />
                </div>
              </div>
            </Surface>
          </div>

          {/* Right column — stats */}
          <div>
            <Surface as="div" className="p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ability Scores
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStats(rollStats())}
                    className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
                  >
                    <Dices className="h-3.5 w-3.5" />
                    Roll
                  </button>
                  <button
                    type="button"
                    onClick={() => setStats(STANDARD_ARRAY)}
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Standard Array
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {STAT_FIELDS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <label
                      htmlFor={key}
                      className="w-28 shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {label}
                    </label>
                    <input
                      id={key}
                      type="number"
                      min={1}
                      max={30}
                      required
                      value={stats[key]}
                      onChange={(e) => handleStatChange(key, e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {isSubmitting ? "Creating…" : "Create Character"}
          </button>
          <button
            type="button"
            onClick={() => void navigate(ROUTES.characters)}
            className="rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
