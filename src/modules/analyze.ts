import { GameConfig, AnalysisResult } from "../types";
import { fetchAllResults } from "../storage/storage";
import {
  getNumberFrequencies,
  getSingleNumberFrequencies,
  getTwoNumberFrequencies,
} from "../analyzer/frequencyAnalysis";
import { getMostCommonGapPatterns } from "../analyzer/gapAnalysis";
import { getHotAndColdNumbers } from "../analyzer/hotAndColdNumbers";

export const analyzeGame = async (
  config: GameConfig
): Promise<AnalysisResult> => {
  const vietlottData = await fetchAllResults(config);

  const gapPatterns = getMostCommonGapPatterns(vietlottData);
  const frequencies = getNumberFrequencies(vietlottData);
  const firstPositionFrequencies = getSingleNumberFrequencies(vietlottData, 0);
  const lastPosition = config.numberCount - 1;
  const lastPositionFrequencies = getSingleNumberFrequencies(
    vietlottData,
    lastPosition
  );
  const twoPositionFrequencies = getTwoNumberFrequencies(
    vietlottData,
    0,
    lastPosition
  );
  const hotCold = getHotAndColdNumbers(vietlottData);

  return {
    gameType: config.gameType,
    gapPatterns,
    frequencies,
    firstPositionFrequencies,
    lastPositionFrequencies,
    twoPositionFrequencies,
    hotCold,
  };
};
