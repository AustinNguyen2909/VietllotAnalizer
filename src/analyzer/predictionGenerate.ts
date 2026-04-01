import { DrawHistory, HotColdEntry } from "../types";
import { getNumberFrequencies } from "./frequencyAnalysis";
import { getFrequentPairs } from "./frequencyPairs";
import { getFrequentTriplets } from "./frequencyTriplets";
import { getMostCommonGapPatterns } from "./gapAnalysis";
import { getHotAndColdNumbers } from "./hotAndColdNumbers";

interface PredictionOptions {
  hotCount?: number;
  tripletThreshold?: number;
  pairThreshold?: number;
}

export function predictNextNumbers(
  results: DrawHistory,
  options: PredictionOptions = {}
): number[] {
  getNumberFrequencies(results);
  const { hotNumbers, coldNumbers } = getHotAndColdNumbers(
    results,
    options.hotCount || 10
  );
  const commonPairs = getFrequentPairs(results);
  const commonTriplets = getFrequentTriplets(results);
  const commonGaps = getMostCommonGapPatterns(results);
  const wheelBase = hotNumbers.slice(0, 12);

  const pickFrom = <T>(arr: T[], count: number): T[] =>
    arr.sort(() => 0.5 - Math.random()).slice(0, count);

  const selectedNumbers = new Set<number>();

  // Add 2 numbers from hot numbers
  pickFrom(hotNumbers, 2).forEach((entry: HotColdEntry) =>
    selectedNumbers.add(entry.number)
  );

  // Add 1 number from cold numbers
  pickFrom(coldNumbers, 1).forEach((entry: HotColdEntry) =>
    selectedNumbers.add(entry.number)
  );

  // Add 1 number from common pairs
  const pairNumbers = commonPairs.flatMap(([pair]) =>
    pair.split("-").map(Number)
  );
  pickFrom(pairNumbers, 1).forEach((num) => selectedNumbers.add(num));

  // Add 1 number from common triplets
  const tripletNumbers = commonTriplets.flatMap(([triplet]) =>
    triplet.split("-").map(Number)
  );
  pickFrom(tripletNumbers, 1).forEach((num) => selectedNumbers.add(num));

  // Use gap analysis to try one likely gap
  const gapsSorted = Object.entries(commonGaps.gapPatternValueMap)
    .sort((a, b) => b[1] - a[1])
    .map(([gap]) => parseInt(gap, 10));
  if (gapsSorted.length > 0 && selectedNumbers.size > 0) {
    const last = Array.from(selectedNumbers)[selectedNumbers.size - 1];
    const candidate = last + gapsSorted[0];
    if (candidate <= 45) selectedNumbers.add(candidate);
  }

  // Fill to 6 numbers with wheel base if needed
  while (selectedNumbers.size < 6) {
    const pick = pickFrom(wheelBase, 1)[0];
    selectedNumbers.add(pick.number);
  }

  return Array.from(selectedNumbers).sort((a, b) => a - b);
}
