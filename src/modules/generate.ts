import { GameConfig, FrequencyAppearanceMap, GenerationConfig, GenerationResult } from "../types";
import {
  fetchAllResults,
  fetchResultByDrawNumb,
} from "../storage/storage";
import { getNumberFrequencies } from "../analyzer/frequencyAnalysis";
import { getMostCommonGapPatterns } from "../analyzer/gapAnalysis";
import { getNumberAppearance } from "../analyzer/appearanceAnalysis";
import { calculateLikelihood } from "../analyzer/likelihoodAnalysis";
import { pick6NumbersByOrder } from "../analyzer/pickNumberRandom";
import { getNumberKeyList } from "../analyzer/numberKeyList";
import { GAME_CONFIGS } from "../config/gameConfig";

const buildFrequencyAppearanceMap = (
  vietlottData: number[][],
  maxNumber: number
): FrequencyAppearanceMap => {
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
};

export const generateNumbers = async (
  config: GameConfig,
  generationConfig: GenerationConfig
): Promise<GenerationResult> => {
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
};

export const testNumberOfRandomPick = async (
  number: number = 10,
  draw: number = 1000
): Promise<boolean> => {
  const config45 = GAME_CONFIGS["45"];
  const vietlottData = await fetchAllResults(config45);
  const vietlottDataToDraw = vietlottData.slice(0, draw);
  const topGapPatterns = getMostCommonGapPatterns(vietlottDataToDraw);
  const gapPatternList = Object.keys(topGapPatterns.gapPatternMap);
  const numberKeyList = getNumberKeyList(vietlottDataToDraw);

  const mapFrequencyAndAppearanceValue = buildFrequencyAppearanceMap(
    vietlottDataToDraw,
    config45.maxNumber
  );

  const likelihoodResults = calculateLikelihood(mapFrequencyAndAppearanceValue);
  const listTestResult: number[][] = [];

  for (let i = 0; i < number; i++) {
    listTestResult.push(
      pick6NumbersByOrder(likelihoodResults, gapPatternList, numberKeyList)
    );
  }

  const result = await fetchResultByDrawNumb(config45, draw + 1);
  return listTestResult.map((item) => item.join(",")).includes(result.join(","));
};
