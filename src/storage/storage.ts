import { Pool } from "pg";
import { config } from "../config/config";
import { Draw, DrawHistory, GameConfig } from "../types";

const pool = new Pool(config.db);

export async function insertResult(
  gameConfig: GameConfig,
  drawDate: string,
  drawNumb: number,
  numbers: number[],
  bonus?: number | null
): Promise<void> {
  const columns = [
    "draw_date",
    "draw_numb",
    ...gameConfig.numberColumns,
    ...(gameConfig.hasBonus ? ["numberextra"] : []),
  ];
  const values: (string | number)[] = [drawDate, drawNumb, ...numbers];
  if (gameConfig.hasBonus && bonus != null) {
    values.push(bonus);
  }

  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
  const query = `INSERT INTO ${gameConfig.tableName} (${columns.join(", ")}) VALUES (${placeholders})`;

  try {
    await pool.query(query, values);
    console.log(`Data inserted successfully into ${gameConfig.tableName}.`);
  } catch (err) {
    console.error("Error inserting data:", err);
  }
}

export async function fetchAllResults(
  gameConfig: GameConfig
): Promise<DrawHistory> {
  const columns = gameConfig.numberColumns.join(", ");
  const query = `SELECT ${columns}, draw_numb FROM ${gameConfig.tableName}`;

  try {
    const result = await pool.query(query);
    const allDraws = result.rows
      .sort(
        (a: Record<string, number>, b: Record<string, number>) =>
          a.draw_numb - b.draw_numb
      )
      .map((item: Record<string, number>) => {
        const { draw_numb: _drawNumb, ...rest } = item;
        return Object.values(rest) as number[];
      });
    return allDraws;
  } catch (err) {
    console.error("Error fetching data:", err);
    return [];
  }
}

export async function fetchHighestDrawNumb(
  gameConfig: GameConfig
): Promise<number> {
  const query = `SELECT draw_numb FROM ${gameConfig.tableName} ORDER BY draw_numb DESC LIMIT 1`;

  try {
    const result = await pool.query(query);
    return result.rows.length ? result.rows[0].draw_numb : 0;
  } catch (err) {
    console.error("Error fetching data:", err);
    return 0;
  }
}

export async function fetchResultByDrawNumb(
  gameConfig: GameConfig,
  drawNumb: number
): Promise<Draw> {
  const columns = gameConfig.numberColumns.join(", ");
  const query = `SELECT ${columns} FROM ${gameConfig.tableName} WHERE draw_numb = $1`;

  try {
    const result = await pool.query(query, [drawNumb]);
    if (result.rows.length) {
      return Object.values(result.rows[0]) as number[];
    }
    return [];
  } catch (err) {
    console.error("Error fetching data:", err);
    return [];
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
