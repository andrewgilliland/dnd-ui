import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useListView } from "./useListView";

const STORAGE_KEY = "dnd-ui-list-view";

beforeEach(() => {
  localStorage.clear();
});

describe("useListView", () => {
  it("defaults to 'cards' when localStorage is empty", () => {
    const { result } = renderHook(() => useListView());
    expect(result.current.listViewMode).toBe("cards");
  });

  it("reads 'table' from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, "table");
    const { result } = renderHook(() => useListView());
    expect(result.current.listViewMode).toBe("table");
  });

  it("reads 'cards' from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, "cards");
    const { result } = renderHook(() => useListView());
    expect(result.current.listViewMode).toBe("cards");
  });

  it("falls back to 'cards' for an invalid stored value", () => {
    localStorage.setItem(STORAGE_KEY, "grid");
    const { result } = renderHook(() => useListView());
    expect(result.current.listViewMode).toBe("cards");
  });

  it("falls back to 'cards' when stored value is null", () => {
    const { result } = renderHook(() => useListView());
    expect(result.current.listViewMode).toBe("cards");
  });

  it("persists new value to localStorage when setter is called", () => {
    const { result } = renderHook(() => useListView());
    act(() => result.current.setListViewMode("table"));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("table");
  });

  it("updates listViewMode state when setter is called", () => {
    const { result } = renderHook(() => useListView());
    act(() => result.current.setListViewMode("table"));
    expect(result.current.listViewMode).toBe("table");
  });

  it("persists back to 'cards' when switched back", () => {
    localStorage.setItem(STORAGE_KEY, "table");
    const { result } = renderHook(() => useListView());
    act(() => result.current.setListViewMode("cards"));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("cards");
    expect(result.current.listViewMode).toBe("cards");
  });
});
