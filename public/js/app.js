// Start preloading results as soon as the page is ready
document.addEventListener("DOMContentLoaded", preloadAllResults);

// Tab navigation
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Helpers
function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}

async function apiCall(url, options = {}) {
  showLoading();
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }
    return data.data;
  } catch (err) {
    alert("Error: " + err.message);
    throw err;
  } finally {
    hideLoading();
  }
}

// ========== RESULTS TAB ==========

// Cache: store loaded results per game type so we never fetch twice
const resultsCache = {};

async function loadResultsForGameType(gameType) {
  if (resultsCache[gameType]) {
    renderResults(resultsCache[gameType], gameType);
    return;
  }
  try {
    const results = await apiCall(`/api/results/${gameType}`);
    resultsCache[gameType] = results;
    renderResults(results, gameType);
  } catch (_) {
    // Error already shown by apiCall
  }
}

// Preload all game types on page load
async function preloadAllResults() {
  const gameTypes = ["45", "55", "35"];
  // Load all in parallel, silently — no loading spinner per individual call
  await Promise.all(gameTypes.map(async (gameType) => {
    try {
      const res = await fetch(`/api/results/${gameType}`, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        resultsCache[gameType] = data.data;
      }
    } catch (_) {
      // Silently ignore preload failures; user can still trigger manually
    }
  }));

  // Render whichever game type is currently selected
  const selected = document.getElementById("results-game-type").value;
  if (resultsCache[selected]) {
    renderResults(resultsCache[selected], selected);
  }
}

// Auto-render from cache when select changes
document.getElementById("results-game-type").addEventListener("change", () => {
  const gameType = document.getElementById("results-game-type").value;
  loadResultsForGameType(gameType);
});

document.getElementById("sync-btn").addEventListener("click", async () => {
  const gameType = document.getElementById("results-game-type").value;
  try {
    const result = await apiCall(`/api/results/sync/${gameType}`, { method: "POST" });
    const statusBox = document.getElementById("sync-status");
    statusBox.classList.remove("hidden", "error");
    statusBox.classList.add("success");
    statusBox.textContent = `Synced ${result.newDraws} new draw(s) for game ${result.gameType}. Highest draw: #${result.highestDrawNumb}`;
    // Invalidate cache and reload for this game type after sync
    delete resultsCache[gameType];
    await loadResultsForGameType(gameType);
  } catch (_) {
    const statusBox = document.getElementById("sync-status");
    statusBox.classList.remove("hidden", "success");
    statusBox.classList.add("error");
    statusBox.textContent = "Sync failed";
  }
});

document.getElementById("load-results-btn").addEventListener("click", async () => {
  const gameType = document.getElementById("results-game-type").value;
  // Force refresh: clear cache for this game type
  delete resultsCache[gameType];
  await loadResultsForGameType(gameType);
});

function renderResults(results, gameType) {
  const container = document.getElementById("results-container");
  if (!results.length) {
    container.innerHTML = '<p class="placeholder">No results found. Try syncing first.</p>';
    return;
  }

  const numCount = gameType === "35" ? 5 : 6;
  const headers = Array.from({ length: numCount }, (_, i) => `#${i + 1}`);

  const rows = results
    .slice()
    .reverse()
    .slice(0, 200)
    .map((draw, idx) => {
      const drawNum = results.length - idx;
      const cells = draw.map((n) => `<td>${n}</td>`).join("");
      return `<tr><td>${drawNum}</td>${cells}</tr>`;
    })
    .join("");

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="results-table">
        <thead><tr><th>Draw</th>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p style="text-align:center;color:#888;margin-top:0.5rem;font-size:0.8rem">
      Showing latest ${Math.min(results.length, 200)} of ${results.length} draws
    </p>
  `;
}

// ========== ANALYSIS TAB ==========

document.getElementById("analyze-btn").addEventListener("click", async () => {
  const gameType = document.getElementById("analysis-game-type").value;
  try {
    const result = await apiCall(`/api/analysis/${gameType}`);
    renderAnalysis(result);
  } catch (_) {
    // Error already shown by apiCall
  }
});

function renderAnalysis(analysis) {
  const container = document.getElementById("analysis-container");

  // Sort frequencies by count descending
  const freqEntries = Object.entries(analysis.frequencies)
    .sort((a, b) => b[1] - a[1]);

  const freqHtml = freqEntries
    .map(([num, count]) => `<div class="freq-item"><span class="num">${num}</span><span class="count">${count}</span></div>`)
    .join("");

  // Hot/Cold numbers
  const hotHtml = analysis.hotCold.hotNumbers
    .map((e) => `<div class="hot-cold-item"><span>${e.number}</span><span>${e.count}x</span></div>`)
    .join("");

  const coldHtml = analysis.hotCold.coldNumbers
    .map((e) => `<div class="hot-cold-item"><span>${e.number}</span><span>${e.count}x</span></div>`)
    .join("");

  // Gap pattern value distribution (top 15)
  const gapValueEntries = Object.entries(analysis.gapPatterns.gapPatternValueMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const gapHtml = gapValueEntries
    .map(([gap, count]) => `<div class="freq-item"><span class="num">${gap}</span><span class="count">${count}</span></div>`)
    .join("");

  // First position frequencies
  const firstPosEntries = Object.entries(analysis.firstPositionFrequencies)
    .sort((a, b) => b[1] - a[1]);

  const firstPosHtml = firstPosEntries
    .map(([num, count]) => `<div class="freq-item"><span class="num">${num}</span><span class="count">${count}</span></div>`)
    .join("");

  // Last position frequencies
  const lastPosEntries = Object.entries(analysis.lastPositionFrequencies)
    .sort((a, b) => b[1] - a[1]);

  const lastPosHtml = lastPosEntries
    .map(([num, count]) => `<div class="freq-item"><span class="num">${num}</span><span class="count">${count}</span></div>`)
    .join("");

  container.innerHTML = `
    <div class="analysis-section">
      <h3>Overall Frequency</h3>
      <div class="freq-grid">${freqHtml}</div>
    </div>
    <div class="analysis-section">
      <h3>Hot & Cold Numbers</h3>
      <div class="hot-cold-grid">
        <div class="hot-cold-column">
          <h4 class="hot">Hot Numbers</h4>
          ${hotHtml}
        </div>
        <div class="hot-cold-column">
          <h4 class="cold">Cold Numbers</h4>
          ${coldHtml}
        </div>
      </div>
    </div>
    <div class="analysis-section">
      <h3>Gap Sum Distribution (Top 15)</h3>
      <div class="freq-grid">${gapHtml}</div>
    </div>
    <div class="analysis-section">
      <h3>First Position Frequency</h3>
      <div class="freq-grid">${firstPosHtml}</div>
    </div>
    <div class="analysis-section">
      <h3>Last Position Frequency</h3>
      <div class="freq-grid">${lastPosHtml}</div>
    </div>
  `;
}

// ========== GENERATE TAB ==========

document.getElementById("generate-btn").addEventListener("click", async () => {
  const gameType = document.getElementById("generate-game-type").value;
  try {
    const result = await apiCall(`/api/generate/${gameType}`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    renderGenerated(result);
  } catch (_) {
    // Error already shown by apiCall
  }
});

function renderGenerated(result) {
  const container = document.getElementById("generate-container");
  const balls = result.numbers
    .map((n) => `<div class="ball">${n}</div>`)
    .join("");

  container.innerHTML = `
    <div class="generate-result">
      <h3>Game ${result.gameType} - Generated Numbers</h3>
      <div class="ball-container">${balls}</div>
      <p style="color:#888;margin-top:1rem;font-size:0.8rem">
        Range: ${result.config.rangesToChoose[0]}-${result.config.rangesToChoose[1]}
      </p>
    </div>
  `;
}
