import { DrawHistory } from "../types";

export function getNumberKeyList(results: DrawHistory): string[] {
  return results.map((draw) => {
    const sortedDraw = [...draw].sort((a, b) => a - b);
    return sortedDraw.join(",");
  });
}
