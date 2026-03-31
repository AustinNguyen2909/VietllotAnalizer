import { GameConfig } from "../types";
import { fetchAllResults } from "../storage/storage";
import {
  getNumberFrequencies,
  getSingleNumberFrequencies,
  getTwoNumberFrequencies,
} from "../analyzer/frequencyAnalysis";
import {
  getMostCommonGapPatterns,
  transformGapNumberToDot,
} from "../analyzer/gapAnalysis";

export const analyzeGame = async (config: GameConfig): Promise<void> => {
  console.log(`--------${config.gameType}--------`);

  const vietlottData = await fetchAllResults(config);

  const topGapPatterns = getMostCommonGapPatterns(vietlottData);
  console.log(
    "Most Common Gap Patterns:",
    transformGapNumberToDot(topGapPatterns.gapPatternValueMap)
  );

  const frequenciesValues = getNumberFrequencies(vietlottData);
  console.log("frequenciesValues", transformGapNumberToDot(frequenciesValues));

  const frequenciesValues0 = getSingleNumberFrequencies(vietlottData, 0);
  console.log(
    "frequenciesValues 1",
    transformGapNumberToDot(frequenciesValues0)
  );

  const lastPosition = config.numberCount - 1;
  const frequenciesValuesLast = getSingleNumberFrequencies(
    vietlottData,
    lastPosition
  );
  console.log(
    `frequenciesValues ${config.numberCount}`,
    transformGapNumberToDot(frequenciesValuesLast)
  );

  const frequenciesValues2Num = getTwoNumberFrequencies(
    vietlottData,
    0,
    lastPosition
  );
  const keyByDots = transformGapNumberToDot(frequenciesValues2Num);
  const sortedEntries = Object.entries(keyByDots).sort(
    (a, b) => b[1].length - a[1].length
  );
  const sortedObject = Object.fromEntries(sortedEntries);
  console.log(
    `frequenciesValues2Num 1-${config.numberCount}`,
    sortedObject
  );

  console.log(`--------${config.gameType}--------`);
};
