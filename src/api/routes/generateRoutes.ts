import { Router, Request, Response } from "express";
import { GameType, GenerationConfig } from "../../types";
import { GAME_CONFIGS } from "../../config/gameConfig";
import { GENERATION_CONFIGS } from "../../config/generationConfig";
import { generateNumbers } from "../../modules/generate";
import { validateGameType } from "../middleware";

const router = Router();

// POST /api/generate/:gameType — generate numbers
router.post("/:gameType", validateGameType, async (req: Request, res: Response) => {
  const gameType = req.params.gameType as GameType;
  const config = GAME_CONFIGS[gameType];

  // Use request body overrides or fall back to default config
  const defaultConfig = GENERATION_CONFIGS[gameType];
  const bodyConfig = req.body as Partial<GenerationConfig> | undefined;

  const generationConfig: GenerationConfig = {
    rangesToChoose: bodyConfig?.rangesToChoose ?? defaultConfig?.rangesToChoose ?? [1, config.maxNumber],
    lowNumberBottomLine: bodyConfig?.lowNumberBottomLine ?? defaultConfig?.lowNumberBottomLine,
    highNumberBottomLine: bodyConfig?.highNumberBottomLine ?? defaultConfig?.highNumberBottomLine,
    exceptionList: bodyConfig?.exceptionList ?? defaultConfig?.exceptionList,
    maxRetries: bodyConfig?.maxRetries ?? defaultConfig?.maxRetries,
  };

  const result = await generateNumbers(config, generationConfig);
  res.json({ success: true, data: result });
});

export default router;
