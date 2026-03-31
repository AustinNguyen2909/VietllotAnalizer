import { FrequencyAppearanceMap, LikelihoodMap } from "../types";

export function calculateLikelihood(
  results: FrequencyAppearanceMap
): LikelihoodMap {
  const entries = Object.entries(results);

  entries.sort((a, b) => {
    const freqA = a[1].frequency;
    const freqB = b[1].frequency;
    const hasNotA = a[1].hasNot;
    const hasNotB = b[1].hasNot;

    if (freqA !== freqB) return freqA - freqB;
    return hasNotB - hasNotA;
  });

  const ordered: LikelihoodMap = {};
  for (let i = 0; i < entries.length; i++) {
    const [num] = entries[i];
    ordered[num] = i + 1;
  }

  return ordered;
}
