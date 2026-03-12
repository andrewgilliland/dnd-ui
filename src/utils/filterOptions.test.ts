import { describe, it, expect } from "vitest";
import {
  uniqueSortedStrings,
  uniqueSortedNumbers,
  toFilterOptions,
} from "./filterOptions";

describe("uniqueSortedStrings", () => {
  it("returns unique values sorted alphabetically", () => {
    expect(uniqueSortedStrings(["beast", "undead", "beast"])).toEqual([
      "beast",
      "undead",
    ]);
  });

  it("sorts case-sensitively via localeCompare", () => {
    expect(uniqueSortedStrings(["zombie", "aberration", "beast"])).toEqual([
      "aberration",
      "beast",
      "zombie",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(uniqueSortedStrings([])).toEqual([]);
  });

  it("handles a single value", () => {
    expect(uniqueSortedStrings(["dragon"])).toEqual(["dragon"]);
  });

  it("deduplicates identical values leaving one entry", () => {
    expect(uniqueSortedStrings(["dragon", "dragon", "dragon"])).toEqual([
      "dragon",
    ]);
  });
});

describe("uniqueSortedNumbers", () => {
  it("returns unique values sorted numerically ascending", () => {
    expect(uniqueSortedNumbers([5, 1, 3, 1, 5])).toEqual([1, 3, 5]);
  });

  it("handles fractional CR values correctly", () => {
    expect(uniqueSortedNumbers([1, 0.5, 0.25, 0.125, 2])).toEqual([
      0.125, 0.25, 0.5, 1, 2,
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(uniqueSortedNumbers([])).toEqual([]);
  });

  it("handles a single value", () => {
    expect(uniqueSortedNumbers([10])).toEqual([10]);
  });
});

describe("toFilterOptions", () => {
  it("maps string values to label/value objects", () => {
    expect(toFilterOptions(["beast", "undead"])).toEqual([
      { label: "beast", value: "beast" },
      { label: "undead", value: "undead" },
    ]);
  });

  it("converts numeric values to strings", () => {
    expect(toFilterOptions([0.25, 1, 5])).toEqual([
      { label: "0.25", value: "0.25" },
      { label: "1", value: "1" },
      { label: "5", value: "5" },
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(toFilterOptions([])).toEqual([]);
  });
});
