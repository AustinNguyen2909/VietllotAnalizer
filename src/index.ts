import { GAME_CONFIGS } from "./config/gameConfig";
import { GENERATION_CONFIGS } from "./config/generationConfig";
import { closePool } from "./storage/storage";
import { fetchAndSaveAllResults, checkIfNumberIsDrawn } from "./modules/result";
import { generateNumbers } from "./modules/generate";

const main = async (): Promise<void> => {
  try {
    // Sync latest draws
    const syncResults = await fetchAndSaveAllResults();
    syncResults.forEach((s) =>
      console.log(`[${s.gameType}] Synced ${s.newDraws} new draws (highest: ${s.highestDrawNumb})`)
    );

    // Check special numbers on 35
    const check1 = await checkIfNumberIsDrawn(GAME_CONFIGS["35"], [5, 13, 19, 23, 30]);
    console.log(`Has my number - ${check1.numbers} been called?`, check1.found);
    const check2 = await checkIfNumberIsDrawn(GAME_CONFIGS["35"], [7, 9, 11, 15, 30]);
    console.log(`Has my number - ${check2.numbers} been called?`, check2.found);

    // Uncomment to run analysis:
    // const { analyzeGame } = await import("./modules/analyze");
    // const { transformGapNumberToDot } = await import("./analyzer/gapAnalysis");
    // const analysis = await analyzeGame(GAME_CONFIGS["45"]);
    // console.log("Frequencies:", transformGapNumberToDot(analysis.frequencies));

    // Generate numbers for 45 and 55
    const genConfig45 = GENERATION_CONFIGS["45"];
    if (genConfig45) {
      const result = await generateNumbers(GAME_CONFIGS["45"], genConfig45);
      console.log(`--------${result.gameType}--------`);
      console.log("randomPickLikelihood 1", result.numbers);
      console.log(`--------${result.gameType}--------`);
    }

    const genConfig55 = GENERATION_CONFIGS["55"];
    if (genConfig55) {
      const result = await generateNumbers(GAME_CONFIGS["55"], genConfig55);
      console.log(`--------${result.gameType}--------`);
      console.log("randomPickLikelihood 1", result.numbers);
      console.log(`--------${result.gameType}--------`);
    }
  } finally {
    await closePool();
  }
};

main();
