import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCardDensity } from "./useCardDensity";

const STORAGE_KEY = "dnd-ui-card-density";

beforeEach(() => {
  localStorage.clear();
});

describe("useCardDensity", () => {
  it("defaults to 'comfortable' when localStorage is empty", () => {
    const { result } = renderHook(() => useCardDensity());
    expect(result.current.cardDensity).toBe("comfortable");
  });

  it("reads 'compact' from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, "compact");
    const { result } = renderHook(() => useCardDensity());
    expect(result.current.cardDensity).toBe("compact");
  });

  it("reads 'comfortable' from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, "comfortable");
    const { result } = renderHook(() => useCardDensity());
    expect(result.current.cardDensity).toBe("comfortable");
  });

  it("falls back to 'comfortable' for an invalid stored value", () => {
    localStorage.setItem(STORAGE_KEY, "dense");
    const { result } = renderHook(() => useCardDensity());
    expect(result.current.cardDensity).toBe("comfortable");
  });

  it("falls back to 'comfortable' when stored value is null", () => {
    const { result } = renderHook(() => useCardDensity());
    expect(result.current.cardDensity).toBe("comfortable");
  });

  it("persists new value to localStorage when setter is called", () => {
    const { result } = renderHook(() => useCardDensity());
    act(() => result.current.setCardDensity("compact"));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("compact");
  });

  it("updates cardDensity state when setter is called", () => {
    const { result } = renderHook(() => useCardDensity());
    act(() => result.current.setCardDensity("compact"));
    expect(result.current.cardDensity).toBe("compact");
  });

  it("persists back to 'comfortable' when switched back", () => {
    localStorage.setItem(STORAGE_KEY, "compact");
    const { result } = renderHook(() => useCardDensity());
    act(() => result.current.setCardDensity("comfortable"));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("comfortable");
    expect(result.current.cardDensity).toBe("comfortable");
  });
});
