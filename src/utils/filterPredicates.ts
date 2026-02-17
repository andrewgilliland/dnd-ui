export function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export function matchesQuery(query: string, values: string[]) {
  if (query.length === 0) {
    return true;
  }

  return values.some((value) => value.toLowerCase().includes(query));
}

export function matchesSelectedValue(selectedValue: string, value: string) {
  return selectedValue.length === 0 || value === selectedValue;
}