export const ROUTES = {
  home: "/",
  characters: "/characters",
  characterDetail: (id: number | string) => `/characters/${id}`,
  items: "/items",
  itemDetail: (id: number | string) => `/items/${id}`,
  monsters: "/monsters",
  monsterDetail: (id: number | string) => `/monsters/${id}`,
  notFound: "/404",
} as const;
