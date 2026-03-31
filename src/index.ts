import { GameType, GenerationConfig } from "./types";
import { GAME_CONFIGS } from "./config/gameConfig";
import { closePool } from "./storage/storage";
import { fetchAndSaveAllResults, checkIfNumberIsDrawnOn35 } from "./modules/result";
// import { analyzeGame } from "./modules/analyze";
import { generateNumbers } from "./modules/generate";

const GENERATION_CONFIGS: Partial<Record<GameType, GenerationConfig>> = {
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

const main = async (): Promise<void> => {
  try {
    await fetchAndSaveAllResults();
    await checkIfNumberIsDrawnOn35();

    // Uncomment to run analysis:
    // const { analyzeGame } = await import("./modules/analyze");
    // await analyzeGame(GAME_CONFIGS["45"]);
    // await analyzeGame(GAME_CONFIGS["55"]);

    const genConfig45 = GENERATION_CONFIGS["45"];
    if (genConfig45) {
      await generateNumbers(GAME_CONFIGS["45"], genConfig45);
    }

    const genConfig55 = GENERATION_CONFIGS["55"];
    if (genConfig55) {
      await generateNumbers(GAME_CONFIGS["55"], genConfig55);
    }
  } finally {
    await closePool();
  }
};

main();
