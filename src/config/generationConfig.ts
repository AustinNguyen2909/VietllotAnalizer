import { GameType, GenerationConfig } from "../types";

export const GENERATION_CONFIGS: Partial<Record<GameType, GenerationConfig>> = {
  "45": {
    rangesToChoose: [24, 42],
    lowNumberBottomLine: 7,
    highNumberBottomLine: 41,
    exceptionList: ["9-41", "2-38", "1-40"],
  },
  "55": {
    rangesToChoose: [34, 51],
    lowNumberBottomLine: 7,
    highNumberBottomLine: 49,
    exceptionList: ["8-54", "9-54", "12-52", "12-53", "1-50"],
  },
};
