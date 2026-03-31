import { DrawHistory, FrequencyMap } from "../types";

export function getNumberAppearance(
  allDraws: DrawHistory,
  maxNumber: number = 45
): FrequencyMap {
  const mapValue: FrequencyMap = {};

  for (let i = 1; i <= maxNumber; i++) {
    mapValue[i] = 0;
  }

  const mapValueKeys = Object.keys(mapValue);

  allDraws.forEach((drawRow) => {
    drawRow.forEach((number) => {
      mapValue[number] = 0;
    });

    mapValueKeys.forEach((key) => {
      if (!drawRow.includes(Number(key))) {
        mapValue[key] = mapValue[key] + 1;
      }
    });
  });

  return mapValue;
}
