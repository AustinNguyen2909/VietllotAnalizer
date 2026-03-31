# Updating Project to Connect to Supabase

Step-by-step guide to update the application code to use your Supabase database instead of local PostgreSQL.

---

## Overview

The good news: since Supabase runs standard PostgreSQL, the `pg` library works with it out of the box. The only changes needed are:

1. Update `.env` with Supabase credentials
2. Add SSL configuration to the database connection
3. Remove Docker dependency

No changes are needed to queries, storage logic, or any module code.

---

## Step 1: Update `.env` File

Replace your local database credentials with Supabase connection details.

**Before** (local PostgreSQL):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=vietlott_user
DB_PASSWORD=vietlott_password
DB_NAME=vietlott_db
```

**After** (Supabase):
```env
DB_HOST=db.ewidfqyceqzpqdeebobp.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR-PASSWORD
DB_NAME=postgres
DB_SSL=true
```

> Replace `YOUR-PASSWORD` with your actual Supabase database password.

> The `DB_SSL=true` flag is new — Supabase requires SSL connections.

> Full connection string for reference:
> ```
> postgresql://postgres:[YOUR-PASSWORD]@db.ewidfqyceqzpqdeebobp.supabase.co:5432/postgres
> ```

---

## Step 2: Update Database Config (`src/config/config.ts`)

Add SSL support to the database configuration.

**Before:**
```ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};
```

**After:**
```ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  },
};
```

**What changed:** One line added — `ssl` configuration that reads from the `DB_SSL` env var. When `DB_SSL=true`, it enables SSL with `rejectUnauthorized: false` (required for Supabase's self-signed certificates). When not set or `false`, SSL is disabled (for local dev).

**That's it for code changes.** The `pg` Pool in `src/storage/storage.ts` already reads from `config.db`, so it automatically picks up the SSL setting. No changes needed to `storage.ts` or any other file.

---

## Step 3: Verify the Connection

Test that the app can connect to Supabase:

```sh
# CLI mode
npm run dev

# Or API mode
npm run dev:api
```

You should see the same output as before — syncing draws, generating numbers, etc. If the connection fails, you'll see a `pg` connection error in the console.

### Quick connection test (optional)

You can also test the raw connection with `psql`:

```sh
psql "postgresql://postgres:[YOUR-PASSWORD]@db.ewidfqyceqzpqdeebobp.supabase.co:5432/postgres?sslmode=require"
```

If this connects successfully, the app will work too.

---

## Step 4: Remove Docker Dependency

Since you're fully switching to Supabase, remove the local PostgreSQL setup:

1. **Stop and remove the Docker container** (if running):
   ```sh
   docker compose down -v
   ```

2. **Delete `docker-compose.yml`**:
   ```sh
   rm docker-compose.yml
   ```

3. **Remove Docker from documentation** — update `CLAUDE.md` and `README.MD` to remove any Docker-related instructions and replace with Supabase setup steps.

---

## Step 5: Update API Server for Production (Optional)

If you plan to deploy the API server (e.g., on Vercel, Railway, Fly.io), set the environment variables in your hosting provider's dashboard instead of using `.env`:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `db.ewidfqyceqzpqdeebobp.supabase.co` |
| `DB_PORT` | `5432` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | `YOUR-PASSWORD` |
| `DB_NAME` | `postgres` |
| `DB_SSL` | `true` |
| `PORT` | `3000` (or whatever your host provides) |

---

## Summary of Changes

| File | Change |
|------|--------|
| `.env` | Replace local credentials with Supabase host/user/password, add `DB_SSL=true` |
| `src/config/config.ts` | Add `ssl` field to db config object (1 line) |
| `docker-compose.yml` | **Deleted** — no longer needed |

**Files NOT changed:**
- `src/storage/storage.ts` — no changes (uses `pg` Pool which supports SSL natively)
- `src/modules/*` — no changes
- `src/api/*` — no changes
- `src/analyzer/*` — no changes
- `public/*` — no changes

---

## Troubleshooting

### "no pg_hba.conf entry for host" or "SSL required"
- You forgot to set `DB_SSL=true` in `.env`, or the `ssl` config isn't being picked up
- Verify `config.ts` has the `ssl` field added

### "connection timeout"
- Check that your Supabase project is active (free-tier projects pause after 1 week of inactivity)
- Go to your Supabase dashboard and click **"Restore project"** if paused

### "password authentication failed"
- Double-check the `DB_PASSWORD` in `.env` matches the password you set when creating the Supabase project
- You can reset it in **Settings** > **Database** > **Database password**

### "relation does not exist"
- The tables haven't been created on Supabase yet — run the migration SQL from `db/migrations/001_init.up.sql` in the Supabase SQL Editor (see the migration guide)

### Slow queries compared to local
- This is expected — network latency to Supabase vs localhost
- For production, pick a Supabase region close to your server
- Consider using the **Connection Pooler** (port `6543`) if you have many concurrent connections
