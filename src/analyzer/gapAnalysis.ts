import { DrawHistory, FrequencyMap, GapAnalysis } from "../types";

export function getMostCommonGapPatterns(results: DrawHistory): GapAnalysis {
  const gapPatternMap: FrequencyMap = {};
  const gapPatternValueMap: FrequencyMap = {};

  results.forEach((draw) => {
    const sortedDraw = [...draw].sort((a, b) => a - b);
    const gaps: number[] = [];

    for (let i = 1; i < sortedDraw.length; i++) {
      gaps.push(sortedDraw[i] - sortedDraw[i - 1]);
    }

    const patternKey = gaps.join(",");
    gapPatternMap[patternKey] = (gapPatternMap[patternKey] || 0) + 1;

    const patternTotal = gaps.reduce((total, next) => total + next, 0);
    gapPatternValueMap[patternTotal] =
      (gapPatternValueMap[patternTotal] || 0) + 1;
  });

  return { gapPatternMap, gapPatternValueMap };
}

export function transformGapNumberToDot(
  result: FrequencyMap
): Record<string, string> {
  const mapValue: Record<string, string> = {};
  for (const [numb, count] of Object.entries(result)) {
    mapValue[numb] = Array(count).fill(".").join("");
  }
  return mapValue;
}
