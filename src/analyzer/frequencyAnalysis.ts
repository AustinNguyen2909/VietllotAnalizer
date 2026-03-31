import { DrawHistory, FrequencyMap } from "../types";

export function getNumberFrequencies(allDraws: DrawHistory): FrequencyMap {
  const allNumbers = allDraws.flat();
  const frequencyMap: FrequencyMap = {};
  for (const num of allNumbers) {
    frequencyMap[num] = (frequencyMap[num] || 0) + 1;
  }
  return frequencyMap;
}

export function getSingleNumberFrequencies(
  allDraws: DrawHistory,
  position: number = 0
): FrequencyMap {
  const frequencyMap: FrequencyMap = {};
  for (const draw of allDraws) {
    const num = draw[position];
    if (num !== undefined) {
      frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    }
  }
  return frequencyMap;
}

export function getTwoNumberFrequencies(
  allDraws: DrawHistory,
  position: number = 0,
  position2: number = 5
): FrequencyMap {
  const frequencyMap: FrequencyMap = {};
  for (const draw of allDraws) {
    if (draw[position] !== undefined && draw[position2] !== undefined) {
      const key = `${draw[position]}-${draw[position2]}`;
      frequencyMap[key] = (frequencyMap[key] || 0) + 1;
    }
  }
  return frequencyMap;
}
