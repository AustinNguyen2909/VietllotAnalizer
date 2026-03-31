# Vietlott Analyzer

## Overview

A TypeScript application that scrapes Vietnamese lottery (Vietlott) draw results from the official website, stores them in PostgreSQL, and performs statistical analysis to generate number predictions. Includes both a CLI entry point and a web-based admin UI with REST API.

Supports three lottery games:
- **Mega 6/45** — pick 6 numbers from 1-45
- **Power 6/55** — pick 6 numbers from 1-55, plus 1 bonus number
- **Max 3D+ (5/35)** — pick 5 numbers from 1-35, plus 1 bonus number

## Tech Stack

- **Language**: TypeScript (strict mode, ES2022 target)
- **Runtime**: Node.js 18+
- **API**: Express 5
- **Frontend**: Vanilla HTML/CSS/JS (no build step)
- **Database**: PostgreSQL 15 (via Docker)
- **Linting**: ESLint with `typescript-eslint`
- **Dependencies**: `express`, `cheerio` (HTML parsing), `pg` (Postgres client), `dotenv`

## Project Structure

```
src/
  types/index.ts                    # Shared types: GameType, GameConfig, Draw, AnalysisResult, etc.
  config/
    config.ts                       # DB config from .env
    gameConfig.ts                   # GAME_CONFIGS — per-game-type URL, table, columns, etc.
    generationConfig.ts             # GENERATION_CONFIGS — per-game generation parameters
  modules/
    result.ts                       # Result module: fetchAndSaveAllResults, checkIfNumberIsDrawn
    analyze.ts                      # Analyze module: analyzeGame → returns AnalysisResult
    generate.ts                     # Generate module: generateNumbers → returns GenerationResult
  api/
    server.ts                       # Express app — serves API + static frontend
    middleware.ts                   # validateGameType, errorHandler
    routes/
      resultRoutes.ts              # /api/results — sync, fetch, check
      analysisRoutes.ts            # /api/analysis — run analysis
      generateRoutes.ts            # /api/generate — generate numbers
  fetcher/
    fetcher.ts                      # Generic fetchVietlottData(config, drawNumb)
    parser.ts                       # parseStandardDraw (6/45), parseBonusDraw (6/55, 5/35)
  storage/
    storage.ts                      # Generic: insertResult, fetchAllResults, fetchHighestDrawNumb, fetchResultByDrawNumb
  analyzer/
    frequencyAnalysis.ts            # Overall, single-position, and two-position frequency counts
    frequencyPairs.ts               # Top 10 most frequent number pairs
    frequencyTriplets.ts            # Top 10 most frequent number triplets
    gapAnalysis.ts                  # Gap patterns between consecutive sorted numbers
    appearanceAnalysis.ts           # Tracks consecutive draws each number has NOT appeared
    hotAndColdNumbers.ts            # Identifies hottest and coldest numbers
    likelihoodAnalysis.ts           # Ranks numbers by likelihood (low frequency + high absence)
    pickNumberRandom.ts             # Weighted random picker with gap/duplicate/range constraints
    numberKeyList.ts                # Generates sorted key strings for each draw (uniqueness checks)
    predictionGenerate.ts           # Composite predictor combining hot/cold, pairs, triplets, gaps
  generator/
    randomGapNumber.ts              # Generates numbers with a target gap sum
  index.ts                          # CLI entry point — calls modules, manages DB pool lifecycle
public/
  index.html                        # Admin UI — single-page with 3 tabs
  css/style.css                     # Styling
  js/app.js                         # Frontend JS — API calls, DOM rendering
db/migrations/001_init.up.sql       # Schema: vietlott_results_45, _55, _35 tables
docker-compose.yml                  # PostgreSQL container setup (reads from .env)
tsconfig.json                       # TypeScript compiler configuration
eslint.config.mjs                   # ESLint flat config with typescript-eslint rules
```

## Architecture

All game types share the same logic, parameterized by `GameConfig` — no code duplication.

**Modules** return structured data (not console.log), making them reusable by both CLI and API:
- **result** — fetching/persisting draw data → `SyncStatus`
- **analyze** — statistical analysis → `AnalysisResult`
- **generate** — number prediction → `GenerationResult`

**Two entry points:**
- `src/index.ts` — CLI that calls modules and logs results
- `src/api/server.ts` — Express server that wraps modules as REST endpoints

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/results/sync` | Sync all game types |
| POST | `/api/results/sync/:gameType` | Sync a single game type |
| GET | `/api/results/:gameType` | Get all draw results |
| GET | `/api/results/:gameType/:drawNumb` | Get single draw result |
| POST | `/api/results/:gameType/check` | Check if numbers were drawn |
| GET | `/api/analysis/:gameType` | Run full analysis |
| POST | `/api/generate/:gameType` | Generate numbers (optional config in body) |

## Running

```sh
docker compose up -d          # Start PostgreSQL (uses .env)
npm install

# CLI mode
npm run build                 # Compile TypeScript
npm start                     # Run CLI (dist/index.js)
npm run dev                   # Run CLI with ts-node

# Web mode
npm run dev:api               # Start API server with ts-node (http://localhost:3000)
npm run start:api             # Start compiled API server (dist/api/server.js)
```

## Linting

```sh
npm run lint                  # Check for lint errors
npm run lint:fix              # Auto-fix lint errors
```

Key ESLint rules enforced:
- `@typescript-eslint/no-unused-vars` — no unused variables (allows `_` prefix)
- `@typescript-eslint/no-explicit-any` — warns on `any` usage
- `prefer-const`, `no-var`, `eqeqeq` — code consistency
- `no-duplicate-imports`, `no-unreachable` — error prevention

## Configuration

Database connection via `.env` file (not committed, covered by `.gitignore`):
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `PORT` — API server port (default: 3000)

The `docker-compose.yml` reads these same variables from `.env` — no hardcoded credentials.

## Development Notes

- The fetcher uses hardcoded browser headers — session cookies/CSRF tokens may expire and need refreshing
- `pick6NumbersByOrder` and `generateFiveNumbersWithGapSum` have recursion with max-retry guards (default 1000)
- No test suite exists (`npm test` is a no-op)
- The `predictionGenerate.ts` analyzer is available but not called in the default flows
- The admin UI is vanilla HTML/CSS/JS served as static files — no frontend build step needed
