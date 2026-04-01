import { useState } from "react";
import ResultsTab from "./components/ResultsTab";
import AnalysisTab from "./components/AnalysisTab";
import GenerateTab from "./components/GenerateTab";
import LoadingSpinner from "./components/LoadingSpinner";
import "./App.css";

type Tab = "results" | "analysis" | "generate";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("results");
  const [loading, setLoading] = useState(false);

  return (
    <>
      <header>
        <h1>Vietlott Analyzer</h1>
        <nav>
          {(["results", "analysis", "generate"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {activeTab === "results" && <ResultsTab setLoading={setLoading} />}
        {activeTab === "analysis" && <AnalysisTab setLoading={setLoading} />}
        {activeTab === "generate" && <GenerateTab setLoading={setLoading} />}
      </main>

      {loading && <LoadingSpinner />}
    </>
  );
}

export default App;
