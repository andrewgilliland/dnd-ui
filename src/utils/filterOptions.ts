export function uniqueSortedStrings(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function uniqueSortedNumbers(values: number[]) {
  return [...new Set(values)].sort((left, right) => left - right);
}

export function toFilterOptions(values: Array<string | number>) {
  return values.map((value) => {
    const normalizedValue = String(value);

    return {
      label: normalizedValue,
      value: normalizedValue,
    };
  });
}