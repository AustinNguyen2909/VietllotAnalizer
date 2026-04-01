import { useState } from "react";
import { GameType, AnalysisResult } from "../types";
import { GAME_CONFIGS } from "../config/gameConfig";
import { analyzeGame } from "../services/analysisService";

interface Props {
  setLoading: (loading: boolean) => void;
}

function AnalysisTab({ setLoading }: Props) {
  const [gameType, setGameType] = useState<GameType>("45");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeGame(GAME_CONFIGS[gameType]);
      setAnalysis(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert("Error: " + message);
    } finally {
      setLoading(false);
    }
  };

  const freqEntries = analysis
    ? Object.entries(analysis.frequencies).sort((a, b) => b[1] - a[1])
    : [];

  const gapValueEntries = analysis
    ? Object.entries(analysis.gapPatterns.gapPatternValueMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
    : [];

  const firstPosEntries = analysis
    ? Object.entries(analysis.firstPositionFrequencies).sort(
        (a, b) => b[1] - a[1]
      )
    : [];

  const lastPosEntries = analysis
    ? Object.entries(analysis.lastPositionFrequencies).sort(
        (a, b) => b[1] - a[1]
      )
    : [];

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
        <button className="btn btn-primary" onClick={handleAnalyze}>
          Run Analysis
        </button>
      </div>

      {!analysis ? (
        <p className="placeholder">
          Select a game type and click "Run Analysis"
        </p>
      ) : (
        <>
          <div className="analysis-section">
            <h3>Overall Frequency</h3>
            <div className="freq-grid">
              {freqEntries.map(([num, count]) => (
                <div className="freq-item" key={num}>
                  <span className="num">{num}</span>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-section">
            <h3>Hot &amp; Cold Numbers</h3>
            <div className="hot-cold-grid">
              <div className="hot-cold-column">
                <h4 className="hot">Hot Numbers</h4>
                {analysis.hotCold.hotNumbers.map((e) => (
                  <div className="hot-cold-item" key={e.number}>
                    <span>{e.number}</span>
                    <span>{e.count}x</span>
                  </div>
                ))}
              </div>
              <div className="hot-cold-column">
                <h4 className="cold">Cold Numbers</h4>
                {analysis.hotCold.coldNumbers.map((e) => (
                  <div className="hot-cold-item" key={e.number}>
                    <span>{e.number}</span>
                    <span>{e.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analysis-section">
            <h3>Gap Sum Distribution (Top 15)</h3>
            <div className="freq-grid">
              {gapValueEntries.map(([gap, count]) => (
                <div className="freq-item" key={gap}>
                  <span className="num">{gap}</span>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-section">
            <h3>First Position Frequency</h3>
            <div className="freq-grid">
              {firstPosEntries.map(([num, count]) => (
                <div className="freq-item" key={num}>
                  <span className="num">{num}</span>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-section">
            <h3>Last Position Frequency</h3>
            <div className="freq-grid">
              {lastPosEntries.map(([num, count]) => (
                <div className="freq-item" key={num}>
                  <span className="num">{num}</span>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default AnalysisTab;
