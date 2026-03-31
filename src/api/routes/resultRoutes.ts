import { Router, Request, Response } from "express";
import { GameType } from "../../types";
import { GAME_CONFIGS } from "../../config/gameConfig";
import { fetchAllResults, fetchResultByDrawNumb } from "../../storage/storage";
import { fetchAndSaveAllResults, fetchAndSaveResults, checkIfNumberIsDrawn } from "../../modules/result";
import { validateGameType } from "../middleware";

const router = Router();

// POST /api/results/sync — sync all game types
router.post("/sync", async (_req: Request, res: Response) => {
  const results = await fetchAndSaveAllResults();
  res.json({ success: true, data: results });
});

// POST /api/results/sync/:gameType — sync a single game type
router.post("/sync/:gameType", validateGameType, async (req: Request, res: Response) => {
  const config = GAME_CONFIGS[req.params.gameType as GameType];
  const result = await fetchAndSaveResults(config);
  res.json({ success: true, data: result });
});

// GET /api/results/:gameType — all results for a game type
router.get("/:gameType", validateGameType, async (req: Request, res: Response) => {
  const config = GAME_CONFIGS[req.params.gameType as GameType];
  const results = await fetchAllResults(config);
  res.json({ success: true, data: results });
});

// GET /api/results/:gameType/:drawNumb — single draw result
router.get("/:gameType/:drawNumb", validateGameType, async (req: Request, res: Response) => {
  const config = GAME_CONFIGS[req.params.gameType as GameType];
  const drawNumb = parseInt(String(req.params.drawNumb), 10);
  if (isNaN(drawNumb)) {
    res.status(400).json({ success: false, error: "Invalid draw number" });
    return;
  }
  const result = await fetchResultByDrawNumb(config, drawNumb);
  res.json({ success: true, data: result });
});

// POST /api/results/:gameType/check — check if numbers have been drawn
router.post("/:gameType/check", validateGameType, async (req: Request, res: Response) => {
  const config = GAME_CONFIGS[req.params.gameType as GameType];
  const { numbers } = req.body as { numbers: number[] };
  if (!Array.isArray(numbers) || numbers.length === 0) {
    res.status(400).json({ success: false, error: "Request body must include 'numbers' array" });
    return;
  }
  const result = await checkIfNumberIsDrawn(config, numbers);
  res.json({ success: true, data: result });
});

export default router;
