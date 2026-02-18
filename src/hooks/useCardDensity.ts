import { useEffect, useState } from "react";

export type CardDensity = "compact" | "comfortable";

const CARD_DENSITY_STORAGE_KEY = "dnd-ui-card-density";

function isCardDensity(value: string | null): value is CardDensity {
  return value === "compact" || value === "comfortable";
}

function getInitialCardDensity(): CardDensity {
  const storedDensity = localStorage.getItem(CARD_DENSITY_STORAGE_KEY);

  if (isCardDensity(storedDensity)) {
    return storedDensity;
  }

  return "comfortable";
}

export function useCardDensity() {
  const [cardDensity, setCardDensity] = useState<CardDensity>(
    getInitialCardDensity,
  );

  useEffect(() => {
    localStorage.setItem(CARD_DENSITY_STORAGE_KEY, cardDensity);
  }, [cardDensity]);

  return { cardDensity, setCardDensity };
}
