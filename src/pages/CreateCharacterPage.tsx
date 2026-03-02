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

const SAVING_THROW_FIELDS: { key: keyof CharacterStats; label: string }[] = [
  { key: "strength", label: "Strength" },
  { key: "dexterity", label: "Dexterity" },
  { key: "constitution", label: "Constitution" },
  { key: "intelligence", label: "Intelligence" },
  { key: "wisdom", label: "Wisdom" },
  { key: "charisma", label: "Charisma" },
];

const ALL_SKILLS: {
  key: string;
  label: string;
  ability: keyof CharacterStats;
}[] = [
  { key: "acrobatics", label: "Acrobatics", ability: "dexterity" },
  { key: "animal_handling", label: "Animal Handling", ability: "wisdom" },
  { key: "arcana", label: "Arcana", ability: "intelligence" },
  { key: "athletics", label: "Athletics", ability: "strength" },
  { key: "deception", label: "Deception", ability: "charisma" },
  { key: "history", label: "History", ability: "intelligence" },
  { key: "insight", label: "Insight", ability: "wisdom" },
  { key: "intimidation", label: "Intimidation", ability: "charisma" },
  { key: "investigation", label: "Investigation", ability: "intelligence" },
  { key: "medicine", label: "Medicine", ability: "wisdom" },
  { key: "nature", label: "Nature", ability: "intelligence" },
  { key: "perception", label: "Perception", ability: "wisdom" },
  { key: "performance", label: "Performance", ability: "charisma" },
  { key: "persuasion", label: "Persuasion", ability: "charisma" },
  { key: "religion", label: "Religion", ability: "intelligence" },
  { key: "sleight_of_hand", label: "Sleight of Hand", ability: "dexterity" },
  { key: "stealth", label: "Stealth", ability: "dexterity" },
  { key: "survival", label: "Survival", ability: "wisdom" },
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

function mod(score: number) {
  return Math.floor((score - 10) / 2);
}

function parseCSV(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500";

const labelClass =
  "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

const sectionHeadingClass =
  "mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

export function CreateCharacterPage() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState<string[]>([]);
  const [races, setRaces] = useState<string[]>([]);

  // Core details
  const [name, setName] = useState("");
  const [race, setRace] = useState<CharacterRace | "">("");
  const [characterClass, setCharacterClass] = useState<CharacterClass | "">("");
  const [alignment, setAlignment] = useState<Alignment | "">("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState(1);

  // Ability scores
  const [stats, setStats] = useState<CharacterStats>(DEFAULT_STATS);

  // Combat
  const [armorClass, setArmorClass] = useState(10);
  const [maxHp, setMaxHp] = useState(10);
  const [walkSpeed, setWalkSpeed] = useState(30);
  const [proficiencyBonus, setProficiencyBonus] = useState(2);

  // Proficiencies & traits
  const [savingThrowProficiencies, setSavingThrowProficiencies] = useState<
    Set<string>
  >(new Set());
  const [skillProficiencies, setSkillProficiencies] = useState<Set<string>>(
    new Set(),
  );
  const [armorProf, setArmorProf] = useState("");
  const [weaponProf, setWeaponProf] = useState("");
  const [toolProf, setToolProf] = useState("");
  const [languages, setLanguages] = useState("");

  // Senses
  const [darkvision, setDarkvision] = useState("");

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

  const toggleSet = (
    _set: Set<string>,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    key: string,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!race || !characterClass || !alignment) return;
    setError(null);
    setIsSubmitting(true);

    try {
      // Compute saving throws from stats + proficiencies
      const saving_throws: Record<string, number> = {};
      for (const { key } of SAVING_THROW_FIELDS) {
        const base = mod(stats[key]);
        saving_throws[key] = savingThrowProficiencies.has(key)
          ? base + proficiencyBonus
          : base;
      }

      // Compute skill bonuses
      const skillsData = ALL_SKILLS.map(({ key, ability }) => {
        const base = mod(stats[ability]);
        const proficient = skillProficiencies.has(key);
        return {
          skill: key,
          bonus: base + (proficient ? proficiencyBonus : 0),
          proficient,
        };
      });

      // Compute passive scores
      const perceptionBonus =
        skillsData.find((s) => s.skill === "perception")?.bonus ?? 0;
      const investigationBonus =
        skillsData.find((s) => s.skill === "investigation")?.bonus ?? 0;
      const insightBonus =
        skillsData.find((s) => s.skill === "insight")?.bonus ?? 0;

      const newCharacter = await createCharacter({
        name,
        race: race as CharacterRace,
        class: characterClass as CharacterClass,
        alignment: alignment as Alignment,
        description,
        level,
        stats,
        proficiency_bonus: proficiencyBonus,
        initiative: mod(stats.dexterity),
        armor_class: armorClass,
        speed: { walk: walkSpeed },
        hit_points: { current: maxHp, max: maxHp, temp: null },
        saving_throws,
        saving_throw_proficiencies: Array.from(savingThrowProficiencies),
        skills: skillsData,
        passive_scores: {
          passive_perception: 10 + perceptionBonus,
          passive_investigation: 10 + investigationBonus,
          passive_insight: 10 + insightBonus,
        },
        senses: darkvision ? { darkvision: Number(darkvision) } : {},
        defenses: [],
        condition_immunities: [],
        proficiencies: {
          armor: parseCSV(armorProf),
          weapons: parseCSV(weaponProf),
          tools: parseCSV(toolProf),
          languages: parseCSV(languages),
        },
        actions: [],
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
          {/* Left / centre columns — details, combat, proficiencies */}
          <div className="space-y-6 lg:col-span-2">
            {/* ── Details ── */}
            <Surface as="div" className="p-6">
              <h3 className={sectionHeadingClass}>Details</h3>

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

                <div className="grid gap-4 sm:grid-cols-3">
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

                  <div>
                    <label htmlFor="level" className={labelClass}>
                      Level
                    </label>
                    <input
                      id="level"
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={level}
                      onChange={(e) => setLevel(Number(e.target.value))}
                      className={inputClass}
                    />
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
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                    placeholder="A brief backstory or description…"
                  />
                </div>
              </div>
            </Surface>

            {/* ── Combat ── */}
            <Surface as="div" className="p-6">
              <h3 className={sectionHeadingClass}>Combat</h3>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label htmlFor="armorClass" className={labelClass}>
                    Armor Class
                  </label>
                  <input
                    id="armorClass"
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={armorClass}
                    onChange={(e) => setArmorClass(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="maxHp" className={labelClass}>
                    Max HP
                  </label>
                  <input
                    id="maxHp"
                    type="number"
                    min={1}
                    required
                    value={maxHp}
                    onChange={(e) => setMaxHp(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="walkSpeed" className={labelClass}>
                    Speed (ft.)
                  </label>
                  <input
                    id="walkSpeed"
                    type="number"
                    min={0}
                    step={5}
                    required
                    value={walkSpeed}
                    onChange={(e) => setWalkSpeed(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="proficiencyBonus" className={labelClass}>
                    Prof. Bonus
                  </label>
                  <input
                    id="proficiencyBonus"
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={proficiencyBonus}
                    onChange={(e) =>
                      setProficiencyBonus(Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </Surface>

            {/* ── Saving Throws ── */}
            <Surface as="div" className="p-6">
              <h3 className={sectionHeadingClass}>
                Saving Throw Proficiencies
              </h3>
              <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                Select the saving throws your character is proficient in.
                Bonuses are computed automatically.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SAVING_THROW_FIELDS.map(({ key, label }) => {
                  const base = mod(stats[key]);
                  const isProficient = savingThrowProficiencies.has(key);
                  const total = base + (isProficient ? proficiencyBonus : 0);
                  return (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-sm text-slate-800 dark:text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={isProficient}
                        onChange={() =>
                          toggleSet(
                            savingThrowProficiencies,
                            setSavingThrowProficiencies,
                            key,
                          )
                        }
                        className="h-4 w-4 rounded border-slate-400 accent-red-700"
                      />
                      <span className={isProficient ? "font-semibold" : ""}>
                        {label}
                      </span>
                      <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                        {total >= 0 ? "+" : ""}
                        {total}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Surface>

            {/* ── Skills ── */}
            <Surface as="div" className="p-6">
              <h3 className={sectionHeadingClass}>Skill Proficiencies</h3>
              <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                Select skills your character is proficient in. Bonuses are
                computed from ability scores.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALL_SKILLS.map(({ key, label, ability }) => {
                  const base = mod(stats[ability]);
                  const isProficient = skillProficiencies.has(key);
                  const total = base + (isProficient ? proficiencyBonus : 0);
                  return (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-sm text-slate-800 dark:text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={isProficient}
                        onChange={() =>
                          toggleSet(
                            skillProficiencies,
                            setSkillProficiencies,
                            key,
                          )
                        }
                        className="h-4 w-4 rounded border-slate-400 accent-red-700"
                      />
                      <span className={isProficient ? "font-semibold" : ""}>
                        {label}
                      </span>
                      <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                        {total >= 0 ? "+" : ""}
                        {total}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Surface>

            {/* ── Proficiencies & Traits ── */}
            <Surface as="div" className="p-6">
              <h3 className={sectionHeadingClass}>
                Proficiencies &amp; Traits
              </h3>
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                Enter comma-separated values for each category.
              </p>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="armorProf" className={labelClass}>
                      Armor
                    </label>
                    <input
                      id="armorProf"
                      type="text"
                      value={armorProf}
                      onChange={(e) => setArmorProf(e.target.value)}
                      className={inputClass}
                      placeholder="Light Armor, Medium Armor…"
                    />
                  </div>
                  <div>
                    <label htmlFor="weaponProf" className={labelClass}>
                      Weapons
                    </label>
                    <input
                      id="weaponProf"
                      type="text"
                      value={weaponProf}
                      onChange={(e) => setWeaponProf(e.target.value)}
                      className={inputClass}
                      placeholder="Simple Weapons, Martial Weapons…"
                    />
                  </div>
                  <div>
                    <label htmlFor="toolProf" className={labelClass}>
                      Tools
                    </label>
                    <input
                      id="toolProf"
                      type="text"
                      value={toolProf}
                      onChange={(e) => setToolProf(e.target.value)}
                      className={inputClass}
                      placeholder="Thieves' Tools, Dragonchess Set…"
                    />
                  </div>
                  <div>
                    <label htmlFor="languages" className={labelClass}>
                      Languages
                    </label>
                    <input
                      id="languages"
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      className={inputClass}
                      placeholder="Common, Elvish…"
                    />
                  </div>
                </div>

                <div className="max-w-xs">
                  <label htmlFor="darkvision" className={labelClass}>
                    Darkvision (ft.)
                  </label>
                  <input
                    id="darkvision"
                    type="number"
                    min={0}
                    step={30}
                    value={darkvision}
                    onChange={(e) => setDarkvision(e.target.value)}
                    className={inputClass}
                    placeholder="Leave blank if none"
                  />
                </div>
              </div>
            </Surface>
          </div>

          {/* Right column — ability scores */}
          <div>
            <Surface as="div" className="p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className={sectionHeadingClass.replace("mb-4 ", "")}>
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
                {STAT_FIELDS.map(({ key, label }) => {
                  const m = mod(stats[key]);
                  return (
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
                      <span className="w-8 shrink-0 text-right text-xs text-slate-500 dark:text-slate-400">
                        {m >= 0 ? "+" : ""}
                        {m}
                      </span>
                    </div>
                  );
                })}
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
