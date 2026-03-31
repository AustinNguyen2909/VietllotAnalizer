import { GameConfig, GameType } from "../types";
import { GAME_CONFIGS } from "../config/gameConfig";
import { fetchVietlottData } from "../fetcher/fetcher";
import {
  insertResult,
  fetchAllResults,
  fetchHighestDrawNumb,
} from "../storage/storage";
import { getNumberKeyList } from "../analyzer/numberKeyList";

const fetchAndSaveResults = async (config: GameConfig): Promise<void> => {
  let drawNumb = await fetchHighestDrawNumb(config);
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
    }
  }
};

export const fetchAndSaveAllResults = async (): Promise<void> => {
  for (const gameType of Object.keys(GAME_CONFIGS) as GameType[]) {
    await fetchAndSaveResults(GAME_CONFIGS[gameType]);
  }
};

export const checkIfNumberIsDrawnOn35 = async (): Promise<void> => {
  const config = GAME_CONFIGS["35"];
  const vietlottData = await fetchAllResults(config);
  const numberKeyList = getNumberKeyList(vietlottData);

  const mySpecialNumber = [5, 13, 19, 23, 30];
  const mySpecialNumberString = mySpecialNumber.join(",");
  const mySpecialNumber2 = [7, 9, 11, 15, 30];
  const mySpecialNumber2String = mySpecialNumber2.join(",");

  console.log(
    `Has my number - ${mySpecialNumber.toString()} been called?`,
    numberKeyList.includes(mySpecialNumberString)
  );
  console.log(
    `Has my number - ${mySpecialNumber2.toString()} been called?`,
    numberKeyList.includes(mySpecialNumber2String)
  );
};
