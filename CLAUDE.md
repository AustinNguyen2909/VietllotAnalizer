# Vietlott Analyzer

## Overview

A TypeScript CLI application that scrapes Vietnamese lottery (Vietlott) draw results from the official website, stores them in PostgreSQL, and performs statistical analysis to generate number predictions.

Supports three lottery games:
- **Mega 6/45** — pick 6 numbers from 1-45
- **Power 6/55** — pick 6 numbers from 1-55, plus 1 bonus number
- **Max 3D+ (5/35)** — pick 5 numbers from 1-35, plus 1 bonus number

## Tech Stack

- **Language**: TypeScript (strict mode, ES2022 target)
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL 15 (via Docker)
- **Linting**: ESLint with `typescript-eslint`
- **Dependencies**: `cheerio` (HTML parsing), `pg` (Postgres client), `dotenv`

## Project Structure

```
src/
  types/index.ts                    # Shared types: GameType, GameConfig, Draw, FrequencyMap, etc.
  config/
    config.ts                       # DB config from .env
    gameConfig.ts                   # GAME_CONFIGS — per-game-type URL, table, columns, etc.
  modules/
    result.ts                       # Result module: fetchAndSaveAllResults, checkIfNumberIsDrawnOn35
    analyze.ts                      # Analyze module: analyzeGame (frequency, gap, pair analysis)
    generate.ts                     # Generate module: generateNumbers, testNumberOfRandomPick
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
  index.ts                          # Entry point — calls modules, manages DB pool lifecycle
db/migrations/001_init.up.sql       # Schema: vietlott_results_45, _55, _35 tables
docker-compose.yml                  # PostgreSQL container setup (reads from .env)
tsconfig.json                       # TypeScript compiler configuration
eslint.config.mjs                   # ESLint flat config with typescript-eslint rules
```

## How It Works

1. **Fetch**: Scrapes draw results from `vietlott.vn` by incrementing draw numbers from the last stored draw
2. **Store**: Inserts new results into PostgreSQL tables (one per game type)
3. **Analyze**: Runs statistical analysis — frequency, gap patterns, appearance tracking
4. **Predict**: Uses likelihood ranking + weighted random selection with constraints (gap patterns, range bounds, uniqueness) to generate number picks

All game types share the same logic, parameterized by `GameConfig` — no code duplication.

The entry point (`index.ts`) is a thin orchestrator that calls three modules:
- **result** — fetching and persisting draw data
- **analyze** — statistical analysis of historical draws
- **generate** — number prediction and pick generation

## Running

```sh
docker compose up -d          # Start PostgreSQL (uses .env)
npm install
npm run build                 # Compile TypeScript
npm start                     # Run compiled JS (dist/index.js)
npm run dev                   # Run directly with ts-node
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

The `docker-compose.yml` reads these same variables from `.env` — no hardcoded credentials.

## Development Notes

- The fetcher uses hardcoded browser headers — session cookies/CSRF tokens may expire and need refreshing
- `pick6NumbersByOrder` and `generateFiveNumbersWithGapSum` have recursion with max-retry guards (default 1000)
- No test suite exists (`npm test` is a no-op)
- The `predictionGenerate.ts` analyzer and `analyzeGame` module are available but not called in the default `main()` flow
