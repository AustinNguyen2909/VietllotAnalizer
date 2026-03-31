import { Router, Request, Response } from "express";
import { GameType } from "../../types";
import { GAME_CONFIGS } from "../../config/gameConfig";
import { analyzeGame } from "../../modules/analyze";
import { validateGameType } from "../middleware";

const router = Router();

// GET /api/analysis/:gameType — full analysis
router.get("/:gameType", validateGameType, async (req: Request, res: Response) => {
  const config = GAME_CONFIGS[req.params.gameType as GameType];
  const result = await analyzeGame(config);
  res.json({ success: true, data: result });
});

export default router;
