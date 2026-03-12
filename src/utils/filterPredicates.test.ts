import { describe, it, expect } from "vitest";
import {
  normalizeQuery,
  matchesQuery,
  matchesSelectedValue,
} from "./filterPredicates";

describe("normalizeQuery", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeQuery("  dragon  ")).toBe("dragon");
  });

  it("lowercases the value", () => {
    expect(normalizeQuery("Dragon")).toBe("dragon");
  });

  it("trims and lowercases together", () => {
    expect(normalizeQuery("  UNDEAD  ")).toBe("undead");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeQuery("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeQuery("   ")).toBe("");
  });
});

describe("matchesQuery", () => {
  it("returns true when query is empty", () => {
    expect(matchesQuery("", ["dragon", "beast"])).toBe(true);
  });

  it("returns true when a value contains the query", () => {
    expect(matchesQuery("drag", ["dragon", "beast"])).toBe(true);
  });

  it("returns true for a full match", () => {
    expect(matchesQuery("dragon", ["dragon"])).toBe(true);
  });

  it("returns false when no value contains the query", () => {
    expect(matchesQuery("goblin", ["dragon", "beast"])).toBe(false);
  });

  it("is case-insensitive against values (query must be pre-normalized)", () => {
    // matchesQuery expects the query to already be lowercased via normalizeQuery;
    // it lowercases the values it searches against but not the query itself.
    expect(matchesQuery("drag", ["Dragon"])).toBe(true);
    expect(matchesQuery("DRAG", ["dragon"])).toBe(false);
  });

  it("returns false for empty values array with non-empty query", () => {
    expect(matchesQuery("dragon", [])).toBe(false);
  });

  it("matches against multiple values and returns true on first match", () => {
    expect(matchesQuery("un", ["undead", "beast", "humanoid"])).toBe(true);
  });
});

describe("matchesSelectedValue", () => {
  it("returns true when selectedValue is empty (show all)", () => {
    expect(matchesSelectedValue("", "beast")).toBe(true);
  });

  it("returns true when selectedValue matches value", () => {
    expect(matchesSelectedValue("beast", "beast")).toBe(true);
  });

  it("returns false when selectedValue does not match value", () => {
    expect(matchesSelectedValue("undead", "beast")).toBe(false);
  });

  it("is an exact match (not substring)", () => {
    expect(matchesSelectedValue("beas", "beast")).toBe(false);
  });
});
