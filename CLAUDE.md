# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — runs `index.js`, which is the single entry point (there is no separate build step, no linter, and no test runner configured; the `npm test` script is a placeholder).
- `docker compose up -d` — brings up the local Postgres (`vietlott_db`) that the app connects to. Credentials/host come from `.env` via `src/config/config.js` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- `npm run db:check` — verifies both the local Postgres and the Supabase pooler connections and prints per-table row counts.
- `npm run db:schema` — creates the three tables on Supabase without copying data.
- `npm run db:migrate` — copies all rows from local Postgres to Supabase (`scripts/migrateToSupabase.js`; supports `--tables=45,55,35`, `--batch=N`, `--truncate`, `--dry-run`). Ids are preserved and inserts use `ON CONFLICT (id) DO NOTHING`, so re-running is safe.
- Schema lives in `db/migrations/001_init.up.sql` and must be applied manually to the running Postgres (no migration runner is wired in). Three tables: `vietlott_results_45`, `vietlott_results_55`, `vietlott_results_35`.

To change what actually runs, edit the `main()` function at the bottom of `index.js` — it's the orchestration surface. Comment/uncomment the calls (`fetAndSaveAllResults`, `mega45Analize`, `generateNumberFor45`, `generateNumberFor55`, `checkIfNumberIsDrawnOn35`, `runTest`, etc.) to select the workflow for a run.

## Language & module style

This project is plain JavaScript (CommonJS) — there is no TypeScript toolchain, no bundler, and no transpile step. Do not add `.ts` files: `node index.js` will not load them. Use `require(...)` / `module.exports`, matching the existing modules.

## Architecture

The app is a pipeline over three Vietlott lottery products (Mega 6/45, Power 6/55, Max 3D 5/35), and every module is written as three near-parallel variants (`*45`, `*55`, `*35`). When adding functionality, expect to touch the same code shape in three places.

Data flow, top to bottom:

1. **Fetcher (`src/fetcher/`)** — `fetcher.js` posts to Vietlott's internal `ajaxpro` endpoint per draw ID, one endpoint per product. Draw IDs are zero-padded to 5 digits. Each request carries hard-coded headers (cookies, CSRF tokens, `x-ajax-token`) copied from a browser session — these expire and will need to be refreshed when fetches start returning empty/failing. `utils.js` holds the `extractLotteryNumbers*` parsers that turn the ajaxpro response into `{ drawDate, numbers, bonus }`.
2. **Storage (`src/storage/storage.js`)** — thin `pg` wrapper. One `Pool` shared across all queries. Each product has its own insert/fetchAll/highest-draw-number helpers. `fetchAll*` returns `number[][]` sorted by `draw_numb` ascending (draw number is stripped from the row before returning) — downstream analyzers assume this shape.
3. **Analyzers (`src/analizer/`)** — pure functions over the `number[][]` draw history:
   - `frequencyAnalize.js` — per-number and per-position frequencies, plus pair frequencies.
   - `gapAnalize.js` — computes the sorted gaps between consecutive numbers in a draw (e.g. `[3, 8, 15, 20, 33, 40]` → `[5,7,5,13,7]`) and ranks gap patterns; `transformGapNumberToDot` is a display helper that renders counts as dot strings.
   - `appearanceAnalize.js` — "draws since last appearance" per number.
   - `likelyhoodAnalize.js` — combines the frequency map and appearance map produced in `index.js` into a per-number likelihood score used to weight picks.
   - `numberKeyList.js` — serializes each historical draw as `"n1,n2,..."` so the generator can cheaply check "has this combination ever been drawn?"
   - `pickNumberRandom.js` (`pick6NumbersByOrder`) — the main generator. Weighted-random-picks numbers using the likelihood scores, then filters candidates against the gap-pattern whitelist, the historical-draw blacklist, an optional value range, and optional low/high thresholds with an exception list.
4. **Generator (`src/generator/randomGapNumber.js`)** — alternative approach: pick a starting number and walk it forward using a known gap pattern. Currently commented out in the orchestration in favor of `pick6NumbersByOrder`.

Key contract to preserve when editing: analyzers all consume the `number[][]` shape from `fetchAllVietlottResult*`, and `pick6NumbersByOrder` expects `likelyHoodResults` keyed by number-as-string plus the `gapPaternList` (array of gap-pattern keys like `"5,7,5,13,7"`) and `numberKeyList` (array of `"n1,n2,..."` strings). Changing any of those shapes ripples through `index.js`.

The `runTest` / `testNumberOfRandomPick` functions in `index.js` are a back-test harness: they train on `vietlottData.slice(0, draw)` and check whether the generator's picks match draw `draw + 1`. Useful for evaluating generator changes.
