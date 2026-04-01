import { useState } from "react";
import { GameType, GenerationResult } from "../types";
import { GAME_CONFIGS } from "../config/gameConfig";
import { GENERATION_CONFIGS } from "../config/generationConfig";
import { generateNumbers } from "../services/generateService";

interface Props {
  setLoading: (loading: boolean) => void;
}

function GenerateTab({ setLoading }: Props) {
  const [gameType, setGameType] = useState<GameType>("45");
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = async () => {
    const genConfig = GENERATION_CONFIGS[gameType];
    if (!genConfig) {
      alert("No generation config available for this game type");
      return;
    }

    setLoading(true);
    try {
      const generated = await generateNumbers(
        GAME_CONFIGS[gameType],
        genConfig
      );
      setResult(generated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert("Error: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="controls">
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value as GameType)}
        >
          <option value="45">Mega 6/45</option>
          <option value="55">Power 6/55</option>
        </select>
        <button className="btn btn-primary" onClick={handleGenerate}>
          Generate Numbers
        </button>
      </div>

      {!result ? (
        <p className="placeholder">
          Select a game type and click "Generate Numbers"
        </p>
      ) : (
        <div className="generate-result">
          <h3>Game {result.gameType} - Generated Numbers</h3>
          <div className="ball-container">
            {result.numbers.map((n, i) => (
              <div className="ball" key={i}>
                {n}
              </div>
            ))}
          </div>
          <p style={{ color: "#888", marginTop: "1rem", fontSize: "0.8rem" }}>
            Range: {result.config.rangesToChoose[0]}-
            {result.config.rangesToChoose[1]}
          </p>
        </div>
      )}
    </section>
  );
}

export default GenerateTab;
