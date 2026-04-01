# Vietlott Analyzer

## Overview

A React + TypeScript application that displays Vietnamese lottery (Vietlott) draw results from Supabase, performs statistical analysis, and generates number predictions — all running client-side. Syncing new results from Vietlott's website is handled by a Supabase Edge Function.

Supports three lottery games:
- **Mega 6/45** — pick 6 numbers from 1-45
- **Power 6/55** — pick 6 numbers from 1-55, plus 1 bonus number
- **Max 3D+ (5/35)** — pick 5 numbers from 1-35, plus 1 bonus number

## Tech Stack

- **Language**: TypeScript
- **Frontend**: React (Create React App)
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Sync**: Supabase Edge Function (Deno) for scraping Vietlott
- **Deployment**: GitHub Pages via `gh-pages`

## Project Structure

```
src/
  index.tsx                          # React entry point
  App.tsx                            # Tab layout (Results, Analysis, Generate)
  App.css                            # Global styles
  utils/
    supabase.ts                      # Supabase client (createClient)
  types/
    index.ts                         # Shared types: GameType, GameConfig, AnalysisResult, etc.
  config/
    gameConfig.ts                    # GAME_CONFIGS — per-game-type table, columns, etc.
    generationConfig.ts              # GENERATION_CONFIGS — per-game generation parameters
  services/
    resultService.ts                 # Fetch results from Supabase, invoke sync edge function
    analysisService.ts               # Run analysis on fetched data (client-side computation)
    generateService.ts               # Generate numbers using fetched data (client-side computation)
  components/
    ResultsTab.tsx                   # Results tab — view draws, sync new data
    AnalysisTab.tsx                  # Analysis tab — frequency, hot/cold, gap patterns
    GenerateTab.tsx                  # Generate tab — weighted random number generation
    LoadingSpinner.tsx               # Shared loading overlay
  analyzer/                          # Pure computation modules (no external dependencies)
    frequencyAnalysis.ts             # Overall, single-position, and two-position frequency counts
    frequencyPairs.ts                # Top 10 most frequent number pairs
    frequencyTriplets.ts             # Top 10 most frequent number triplets
    gapAnalysis.ts                   # Gap patterns between consecutive sorted numbers
    appearanceAnalysis.ts            # Tracks consecutive draws each number has NOT appeared
    hotAndColdNumbers.ts             # Identifies hottest and coldest numbers
    likelihoodAnalysis.ts            # Ranks numbers by likelihood (low frequency + high absence)
    pickNumberRandom.ts              # Weighted random picker with gap/duplicate/range constraints
    numberKeyList.ts                 # Generates sorted key strings for each draw
    predictionGenerate.ts            # Composite predictor combining hot/cold, pairs, triplets, gaps
  generator/
    randomGapNumber.ts               # Generates numbers with a target gap sum
supabase/
  functions/
    sync-results/
      index.ts                       # Edge Function: scrape Vietlott, insert into Supabase
```

## Architecture

**Client-side only** — no backend server. The React app connects directly to Supabase for data.

- **Reading data**: `@supabase/supabase-js` queries PostgreSQL tables directly
- **Analysis & generation**: All 11 analyzer modules are pure TypeScript computation that runs in the browser
- **Syncing new draws**: A Supabase Edge Function scrapes Vietlott's website and inserts new rows. Invoked from React via `supabase.functions.invoke()`.

## Running

```sh
npm install
npm start              # Dev server at http://localhost:3000
npm run build          # Production build to build/
npm run deploy         # Deploy to GitHub Pages
```

## Environment Variables

Create `.env.local` (not committed):
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
```

## Supabase Edge Function

The `sync-results` edge function lives in `supabase/functions/sync-results/`. Deploy it with:
```sh
supabase functions deploy sync-results
```

It uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (auto-injected by Supabase runtime).

## Deployment

GitHub Pages deployment:
```sh
npm run build    # Compile React to static files
npm run deploy   # Push build/ to gh-pages branch
```

Set `"homepage"` in `package.json` to your GitHub Pages URL if using a custom path.

## Development Notes

- The analyzer modules are pure computation with zero browser/Node dependencies
- `pick6NumbersByOrder` and `generateFiveNumbersWithGapSum` have recursion with max-retry guards (default 1000)
- The `predictionGenerate.ts` analyzer is available but not called in the default flows
- No test suite exists (`npm test` runs CRA's default test runner)
- The Vietlott fetcher in the edge function uses hardcoded browser headers — session cookies/CSRF tokens may expire
