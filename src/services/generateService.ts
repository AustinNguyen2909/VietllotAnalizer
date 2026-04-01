import {
  GameConfig,
  FrequencyAppearanceMap,
  GenerationConfig,
  GenerationResult,
} from "../types";
import { requireAuth } from "../utils/supabase";
import { fetchAllResults } from "./resultService";
import { getNumberFrequencies } from "../analyzer/frequencyAnalysis";
import { getMostCommonGapPatterns } from "../analyzer/gapAnalysis";
import { getNumberAppearance } from "../analyzer/appearanceAnalysis";
import { calculateLikelihood } from "../analyzer/likelihoodAnalysis";
import { pick6NumbersByOrder } from "../analyzer/pickNumberRandom";
import { getNumberKeyList } from "../analyzer/numberKeyList";

function buildFrequencyAppearanceMap(
  vietlottData: number[][],
  maxNumber: number
): FrequencyAppearanceMap {
  const frequenciesValues = getNumberFrequencies(vietlottData);
  const numberAppearance = getNumberAppearance(vietlottData, maxNumber);
  const mapFrequencyAndAppearanceValue: FrequencyAppearanceMap = {};

  Object.keys(frequenciesValues).forEach((key) => {
    mapFrequencyAndAppearanceValue[key] = {
      frequency: frequenciesValues[key],
      hasNot: 0,
    };
  });

  Object.keys(numberAppearance).forEach((key) => {
    mapFrequencyAndAppearanceValue[key] = {
      ...mapFrequencyAndAppearanceValue[key],
      hasNot: numberAppearance[key],
    };
  });

  return mapFrequencyAndAppearanceValue;
}

export async function generateNumbers(
  config: GameConfig,
  generationConfig: GenerationConfig
): Promise<GenerationResult> {
  await requireAuth();

  const vietlottData = await fetchAllResults(config);
  const topGapPatterns = getMostCommonGapPatterns(vietlottData);
  const gapPatternList = Object.keys(topGapPatterns.gapPatternMap);
  const numberKeyList = getNumberKeyList(vietlottData);

  const mapFrequencyAndAppearanceValue = buildFrequencyAppearanceMap(
    vietlottData,
    config.maxNumber
  );

  const likelihoodResults = calculateLikelihood(mapFrequencyAndAppearanceValue);
  const numbers = pick6NumbersByOrder(
    likelihoodResults,
    gapPatternList,
    numberKeyList,
    generationConfig
  );

  return {
    gameType: config.gameType,
    numbers,
    config: generationConfig,
  };
}
