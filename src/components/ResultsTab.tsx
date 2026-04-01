import { useState, useEffect, useCallback, useRef } from "react";
import { GameType } from "../types";
import { GAME_CONFIGS } from "../config/gameConfig";
import { fetchAllResults, syncResults } from "../services/resultService";

interface Props {
  setLoading: (loading: boolean) => void;
}

const resultsCache: Record<string, number[][]> = {};

function ResultsTab({ setLoading }: Props) {
  const [gameType, setGameType] = useState<GameType>("45");
  const [results, setResults] = useState<number[][]>([]);
  const [syncStatus, setSyncStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const preloaded = useRef(false);

  const loadResults = useCallback(
    async (gt: GameType, forceRefresh = false) => {
      if (!forceRefresh && resultsCache[gt]) {
        setResults(resultsCache[gt]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchAllResults(GAME_CONFIGS[gt]);
        resultsCache[gt] = data;
        setResults(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        alert("Error: " + message);
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  // Preload all game types on mount
  useEffect(() => {
    if (preloaded.current) return;
    preloaded.current = true;

    async function preloadAll() {
      const gameTypes: GameType[] = ["45", "55", "35"];
      await Promise.all(
        gameTypes.map(async (gt) => {
          try {
            const data = await fetchAllResults(GAME_CONFIGS[gt]);
            resultsCache[gt] = data;
          } catch {
            // Silently ignore preload failures
          }
        })
      );
      // Render whichever is currently selected
      if (resultsCache[gameType]) {
        setResults(resultsCache[gameType]);
      }
    }

    preloadAll();
  }, [gameType]);

  // Auto-render from cache when game type changes
  useEffect(() => {
    loadResults(gameType);
  }, [gameType, loadResults]);

  const handleSync = async () => {
    setLoading(true);
    setSyncStatus(null);
    try {
      const result = await syncResults(gameType);
      setSyncStatus({
        type: "success",
        message: `Synced ${result.newDraws} new draw(s) for game ${result.gameType}. Highest draw: #${result.highestDrawNumb}`,
      });
      delete resultsCache[gameType];
      await loadResults(gameType, true);
    } catch {
      setSyncStatus({ type: "error", message: "Sync failed" });
    } finally {
      setLoading(false);
    }
  };

  const numCount = gameType === "35" ? 5 : 6;
  const headers = Array.from({ length: numCount }, (_, i) => `#${i + 1}`);

  const displayResults = results
    .slice()
    .reverse()
    .slice(0, 200);

  return (
    <section>
      <div className="controls">
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value as GameType)}
        >
          <option value="45">Mega 6/45</option>
          <option value="55">Power 6/55</option>
          <option value="35">Max 3D+ 5/35</option>
        </select>
        <button className="btn btn-primary" onClick={handleSync}>
          Sync Latest
        </button>
        <button
          className="btn"
          onClick={() => {
            delete resultsCache[gameType];
            loadResults(gameType, true);
          }}
        >
          Load Results
        </button>
      </div>

      {syncStatus && (
        <div className={`status-box ${syncStatus.type}`}>
          {syncStatus.message}
        </div>
      )}

      {results.length === 0 ? (
        <p className="placeholder">
          No results found. Try syncing first.
        </p>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Draw</th>
                  {headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayResults.map((draw, idx) => {
                  const drawNum = results.length - idx;
                  return (
                    <tr key={drawNum}>
                      <td>{drawNum}</td>
                      {draw.map((n, i) => (
                        <td key={i}>{n}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p
            style={{
              textAlign: "center",
              color: "#888",
              marginTop: "0.5rem",
              fontSize: "0.8rem",
            }}
          >
            Showing latest {Math.min(results.length, 200)} of {results.length}{" "}
            draws
          </p>
        </>
      )}
    </section>
  );
}

export default ResultsTab;
