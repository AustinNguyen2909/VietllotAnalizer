import { DrawHistory, HotColdResult } from "../types";

export function getHotAndColdNumbers(
  results: DrawHistory,
  topCount: number = 6
): HotColdResult {
  const frequencyMap: Record<number, number> = {};

  results.flat().forEach((number) => {
    frequencyMap[number] = (frequencyMap[number] || 0) + 1;
  });

  const sorted = Object.entries(frequencyMap)
    .map(([number, count]) => ({ number: parseInt(number, 10), count }))
    .sort((a, b) => b.count - a.count);

  const hotNumbers = sorted.slice(0, topCount);
  const coldNumbers = sorted.slice(-topCount).reverse();

  return { hotNumbers, coldNumbers };
}
