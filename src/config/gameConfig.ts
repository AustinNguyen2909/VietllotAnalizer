import { GameConfig, GameType } from "../types";

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  "45": {
    gameType: "45",
    tableName: "vietlott_results_45",
    url: "https://www.vietlott.vn/ajaxpro/Vietlott.PlugIn.WebParts.Game645ResultDetailWebPart,Vietlott.PlugIn.WebParts.ashx",
    requestKey: "f87967fb",
    referer:
      "https://www.vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/645",
    numberCount: 6,
    maxNumber: 45,
    hasBonus: false,
    numberColumns: [
      "number1",
      "number2",
      "number3",
      "number4",
      "number5",
      "number6",
    ],
  },
  "55": {
    gameType: "55",
    tableName: "vietlott_results_55",
    url: "https://www.vietlott.vn/ajaxpro/Vietlott.PlugIn.WebParts.Game655ResultDetailWebPart,Vietlott.PlugIn.WebParts.ashx",
    requestKey: "f87967fb",
    referer:
      "https://www.vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/655",
    numberCount: 6,
    maxNumber: 55,
    hasBonus: true,
    numberColumns: [
      "number1",
      "number2",
      "number3",
      "number4",
      "number5",
      "number6",
    ],
  },
  "35": {
    gameType: "35",
    tableName: "vietlott_results_35",
    url: "https://www.vietlott.vn/ajaxpro/Vietlott.PlugIn.WebParts.Game535ResultDetailWebPart,Vietlott.PlugIn.WebParts.ashx",
    requestKey: "682f5b62",
    referer:
      "https://www.vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/535",
    numberCount: 5,
    maxNumber: 35,
    hasBonus: true,
    numberColumns: ["number1", "number2", "number3", "number4", "number5"],
  },
};
