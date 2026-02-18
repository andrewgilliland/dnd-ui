import type {
  CharactersResponse,
  ClassesResponse,
  ItemsResponse,
  MonstersResponse,
  RacesResponse,
} from "../types/api";
import type { Character, Item, Monster } from "../types";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://127.0.0.1:8000";

interface RequestOptions {
  signal?: AbortSignal;
}

type QueryValue = string | number | boolean | null | undefined;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string, query: Record<string, QueryValue> = {}) {
  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL
    : `${API_BASE_URL}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, normalizedBase);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url;
}

async function getJson<T>(
  path: string,
  query: Record<string, QueryValue> = {},
  options: RequestOptions = {},
) {
  const url = buildUrl(path, query);
  const response = await fetch(url, {
    method: "GET",
    signal: options.signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const errorBody = (await response.json()) as { detail?: string };

      if (typeof errorBody.detail === "string") {
        message = errorBody.detail;
      }
    } catch {
      // no-op, keep generic message
    }

    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export interface CharacterListParams {
  [key: string]: QueryValue;
  skip?: number;
  limit?: number;
  class?: string;
  race?: string;
  name?: string;
}

export interface MonsterListParams {
  [key: string]: QueryValue;
  skip?: number;
  limit?: number;
  type?: string;
  size?: string;
  name?: string;
  min_cr?: number;
  max_cr?: number;
}

export interface ItemListParams {
  [key: string]: QueryValue;
  skip?: number;
  limit?: number;
  type?: string;
  rarity?: string;
  magic?: boolean;
  attunement?: boolean;
  name?: string;
  min_cost?: number;
  max_cost?: number;
}

export function getCharacters(
  params: CharacterListParams = {},
  options: RequestOptions = {},
) {
  return getJson<CharactersResponse>("/api/v1/characters", params, options);
}

export function getCharacterById(
  characterId: number,
  options: RequestOptions = {},
) {
  return getJson<Character>(`/api/v1/characters/${characterId}`, {}, options);
}

export function getMonsters(
  params: MonsterListParams = {},
  options: RequestOptions = {},
) {
  return getJson<MonstersResponse>("/api/v1/monsters", params, options);
}

export function getMonsterById(
  monsterId: number,
  options: RequestOptions = {},
) {
  return getJson<Monster>(`/api/v1/monsters/${monsterId}`, {}, options);
}

export function getItems(
  params: ItemListParams = {},
  options: RequestOptions = {},
) {
  return getJson<ItemsResponse>("/api/v1/items", params, options);
}

export function getItemById(itemId: number, options: RequestOptions = {}) {
  return getJson<Item>(`/api/v1/items/${itemId}`, {}, options);
}

export function getClasses(options: RequestOptions = {}) {
  return getJson<ClassesResponse>("/api/v1/classes", {}, options);
}

export function getRaces(options: RequestOptions = {}) {
  return getJson<RacesResponse>("/api/v1/races", {}, options);
}
