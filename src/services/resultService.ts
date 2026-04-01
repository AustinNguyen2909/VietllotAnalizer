import { supabase, requireAuth } from "../utils/supabase";
import { DrawHistory, GameConfig, GameType, SyncStatus } from "../types";
import { GAME_CONFIGS } from "../config/gameConfig";

export async function fetchAllResults(
  gameConfig: GameConfig
): Promise<DrawHistory> {
  await requireAuth();

  const columns = [...gameConfig.numberColumns, "draw_numb"].join(", ");
  const PAGE_SIZE = 1000;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allRows: any[] = [];
  let from = 0;

  // Supabase limits queries to 1000 rows by default — paginate to get all
  while (true) {
    const { data, error } = await supabase
      .from(gameConfig.tableName)
      .select(columns)
      .order("draw_numb", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRows.map((row: Record<string, number>) => {
    const { draw_numb: _drawNumb, ...rest } = row;
    return Object.values(rest) as number[];
  });
}

export async function fetchHighestDrawNumb(
  gameConfig: GameConfig
): Promise<number> {
  await requireAuth();

  const { data, error } = await supabase
    .from(gameConfig.tableName)
    .select("draw_numb")
    .order("draw_numb", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch highest draw: ${error.message}`);
  }

  return data && data.length > 0 ? data[0].draw_numb : 0;
}

export async function fetchResultByDrawNumb(
  gameConfig: GameConfig,
  drawNumb: number
): Promise<number[]> {
  await requireAuth();

  const columns = gameConfig.numberColumns.join(", ");

  const { data, error } = await supabase
    .from(gameConfig.tableName)
    .select(columns)
    .eq("draw_numb", drawNumb)
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch draw: ${error.message}`);
  }

  if (data && data.length > 0) {
    return Object.values(data[0]) as unknown as number[];
  }
  return [];
}

export async function syncResults(
  gameType: GameType
): Promise<SyncStatus> {
  await requireAuth();

  const { data, error } = await supabase.functions.invoke("sync-results", {
    body: { gameType },
  });

  if (error) {
    throw new Error(`Sync failed: ${error.message}`);
  }

  return data as SyncStatus;
}

export async function syncAllResults(): Promise<SyncStatus[]> {
  await requireAuth();

  const results: SyncStatus[] = [];
  for (const gameType of Object.keys(GAME_CONFIGS) as GameType[]) {
    const status = await syncResults(gameType);
    results.push(status);
  }
  return results;
}
