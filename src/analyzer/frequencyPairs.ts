import { DrawHistory } from "../types";

export function getFrequentPairs(
  results: DrawHistory
): [string, number][] {
  const pairCounts: Record<string, number> = {};

  for (const draw of results) {
    const sorted = draw.slice().sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const key = `${sorted[i]}-${sorted[j]}`;
        pairCounts[key] = (pairCounts[key] || 0) + 1;
      }
    }
  }

  return Object.entries(pairCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}
