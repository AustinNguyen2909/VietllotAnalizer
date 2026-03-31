import { Request, Response, NextFunction } from "express";
import { GameType } from "../types";
import { GAME_CONFIGS } from "../config/gameConfig";

const VALID_GAME_TYPES = Object.keys(GAME_CONFIGS) as GameType[];

export function validateGameType(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const gameType = req.params.gameType as GameType;
  if (!VALID_GAME_TYPES.includes(gameType)) {
    res.status(400).json({
      success: false,
      error: `Invalid game type: "${req.params.gameType}". Valid types: ${VALID_GAME_TYPES.join(", ")}`,
    });
    return;
  }
  next();
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("API Error:", err.message);
  res.status(500).json({
    success: false,
    error: err.message,
  });
}
