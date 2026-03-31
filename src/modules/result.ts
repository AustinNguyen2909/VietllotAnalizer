import { GameConfig, GameType, SyncStatus, NumberCheckResult } from "../types";
import { GAME_CONFIGS } from "../config/gameConfig";
import { fetchVietlottData } from "../fetcher/fetcher";
import {
  insertResult,
  fetchAllResults,
  fetchHighestDrawNumb,
} from "../storage/storage";
import { getNumberKeyList } from "../analyzer/numberKeyList";

export const fetchAndSaveResults = async (
  config: GameConfig
): Promise<SyncStatus> => {
  const startDrawNumb = await fetchHighestDrawNumb(config);
  let drawNumb = startDrawNumb;
  let hasData = true;

  while (hasData) {
    drawNumb++;
    const dataFetch = await fetchVietlottData(config, drawNumb);
    if (dataFetch?.numbers) {
      await insertResult(
        config,
        dataFetch.drawDate ?? "",
        drawNumb,
        dataFetch.numbers,
        dataFetch.bonus
      );
    } else {
      hasData = false;
      drawNumb--;
    }
  }

  return {
    gameType: config.gameType,
    newDraws: drawNumb - startDrawNumb,
    highestDrawNumb: drawNumb,
  };
};

export const fetchAndSaveAllResults = async (): Promise<SyncStatus[]> => {
  const results: SyncStatus[] = [];
  for (const gameType of Object.keys(GAME_CONFIGS) as GameType[]) {
    const status = await fetchAndSaveResults(GAME_CONFIGS[gameType]);
    results.push(status);
  }
  return results;
};

export const checkIfNumberIsDrawn = async (
  config: GameConfig,
  numbers: number[]
): Promise<NumberCheckResult> => {
  const vietlottData = await fetchAllResults(config);
  const numberKeyList = getNumberKeyList(vietlottData);
  const sorted = [...numbers].sort((a, b) => a - b);
  const numberString = sorted.join(",");

  return {
    numbers: sorted,
    found: numberKeyList.includes(numberString),
  };
};
