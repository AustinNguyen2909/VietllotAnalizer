import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./utils/supabase";
import LoginPage from "./components/LoginPage";
import ResultsTab from "./components/ResultsTab";
import AnalysisTab from "./components/AnalysisTab";
import GenerateTab from "./components/GenerateTab";
import LoadingSpinner from "./components/LoadingSpinner";
import "./App.css";

type Tab = "results" | "analysis" | "generate";

function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<Tab>("results");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still resolving session
  if (session === undefined) return <LoadingSpinner />;

  if (!session) return <LoginPage />;

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
          <button
            className="tab-btn"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
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
