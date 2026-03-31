import { DrawHistory } from "../types";

export function getFrequentTriplets(
  results: DrawHistory
): [string, number][] {
  const tripletCounts: Record<string, number> = {};

  for (const draw of results) {
    const sorted = draw.slice().sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        for (let k = j + 1; k < sorted.length; k++) {
          const key = `${sorted[i]}-${sorted[j]}-${sorted[k]}`;
          tripletCounts[key] = (tripletCounts[key] || 0) + 1;
        }
      }
    }
  }

  return Object.entries(tripletCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}
