export type GameType = "45" | "55" | "35";

export interface GameConfig {
  gameType: GameType;
  tableName: string;
  url: string;
  requestKey: string;
  referer: string;
  numberCount: number;
  maxNumber: number;
  hasBonus: boolean;
  numberColumns: string[];
}

export type Draw = number[];
export type DrawHistory = Draw[];

export interface FetchedDraw {
  numbers: number[];
  drawDate: string | null;
  bonus: number | null;
}

export type FrequencyMap = Record<string, number>;

export interface GapAnalysis {
  gapPatternMap: FrequencyMap;
  gapPatternValueMap: FrequencyMap;
}

export type FrequencyAppearanceMap = Record<
  string,
  { frequency: number; hasNot: number }
>;

export type LikelihoodMap = Record<string, number>;

export interface GenerationConfig {
  rangesToChoose: [number, number];
  lowNumberBottomLine?: number;
  highNumberBottomLine?: number;
  exceptionList?: string[];
  maxRetries?: number;
}

export interface HotColdEntry {
  number: number;
  count: number;
}

export interface HotColdResult {
  hotNumbers: HotColdEntry[];
  coldNumbers: HotColdEntry[];
}

export interface VietlottApiResponse {
  value: {
    RetExtraParam1: string;
  };
}
