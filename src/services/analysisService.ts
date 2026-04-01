import { GameConfig, AnalysisResult } from "../types";
import { requireAuth } from "../utils/supabase";
import { fetchAllResults } from "./resultService";
import {
  getNumberFrequencies,
  getSingleNumberFrequencies,
  getTwoNumberFrequencies,
} from "../analyzer/frequencyAnalysis";
import { getMostCommonGapPatterns } from "../analyzer/gapAnalysis";
import { getHotAndColdNumbers } from "../analyzer/hotAndColdNumbers";

export async function analyzeGame(
  config: GameConfig
): Promise<AnalysisResult> {
  await requireAuth();

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
}
