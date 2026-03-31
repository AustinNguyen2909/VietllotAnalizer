# Supabase Database Migration Guide

Step-by-step guide to migrate your local PostgreSQL data to Supabase.

---

## Prerequisites

- A Supabase account ([supabase.com](https://supabase.com))
- `psql` CLI installed locally (ships with PostgreSQL)
- Your local PostgreSQL database running with data

---

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `vietlott-analyzer` (or any name you prefer)
   - **Database Password**: choose a strong password — **save this, you'll need it**
   - **Region**: pick the closest region to you (e.g., `Southeast Asia (Singapore)`)
4. Click **"Create new project"** and wait for it to provision (~2 minutes)

---

## Step 2: Get Your Supabase Connection Details

1. In your Supabase project dashboard, go to **Settings** > **Database**
2. Scroll to **Connection string** section
3. Note down these values (you'll need them for both migration and `.env`):

| Field | Where to find | Example |
|-------|---------------|---------|
| **Host** | Connection string > Host | `db.ewidfqyceqzpqdeebobp.supabase.co` |
| **Port** | Connection string > Port | `5432` |
| **Database** | Always | `postgres` |
| **User** | Always | `postgres` |
| **Password** | The password you set in Step 1 | `your-db-password` |

4. You can also find the full connection string under **Connection string** > **URI** tab:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.ewidfqyceqzpqdeebobp.supabase.co:5432/postgres
   ```

> **Note**: If you plan to connect from a serverless environment or have connection pooling needs, use the **Connection Pooler** details instead (port `6543`, mode `transaction`). For this CLI/API app, the direct connection is fine.

---

## Step 3: Create Tables on Supabase

You have two options:

### Option A: Using the Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Paste the contents of your migration file `db/migrations/001_init.up.sql`:

```sql
CREATE TABLE vietlott_results_45 (
    id SERIAL PRIMARY KEY,
    draw_date DATE NOT NULL,
    number1 SMALLINT NOT NULL,
    number2 SMALLINT NOT NULL,
    number3 SMALLINT NOT NULL,
    number4 SMALLINT NOT NULL,
    number5 SMALLINT NOT NULL,
    number6 SMALLINT NOT NULL,
    draw_numb INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vietlott_results_55 (
    id SERIAL PRIMARY KEY,
    draw_date DATE NOT NULL,
    number1 SMALLINT NOT NULL,
    number2 SMALLINT NOT NULL,
    number3 SMALLINT NOT NULL,
    number4 SMALLINT NOT NULL,
    number5 SMALLINT NOT NULL,
    number6 SMALLINT NOT NULL,
    numberextra SMALLINT NOT NULL,
    draw_numb INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vietlott_results_35 (
    id SERIAL PRIMARY KEY,
    draw_date DATE NOT NULL,
    number1 SMALLINT NOT NULL,
    number2 SMALLINT NOT NULL,
    number3 SMALLINT NOT NULL,
    number4 SMALLINT NOT NULL,
    number5 SMALLINT NOT NULL,
    numberextra SMALLINT NOT NULL,
    draw_numb INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Click **"Run"** to execute

### Option B: Using psql CLI

```sh
psql "postgresql://postgres:[YOUR-PASSWORD]@db.ewidfqyceqzpqdeebobp.supabase.co:5432/postgres" \
  -f db/migrations/001_init.up.sql
```

---

## Step 4: Export Data from Local PostgreSQL

Export each table as a CSV file from your local database:

```sh
# Export vietlott_results_45
psql "postgresql://vietlott_user:vietlott_password@localhost:5432/vietlott_db" \
  -c "\COPY vietlott_results_45 (draw_date, draw_numb, number1, number2, number3, number4, number5, number6, created_at) TO 'vietlott_results_45.csv' WITH CSV HEADER"

# Export vietlott_results_55
psql "postgresql://vietlott_user:vietlott_password@localhost:5432/vietlott_db" \
  -c "\COPY vietlott_results_55 (draw_date, draw_numb, number1, number2, number3, number4, number5, number6, numberextra, created_at) TO 'vietlott_results_55.csv' WITH CSV HEADER"

# Export vietlott_results_35
psql "postgresql://vietlott_user:vietlott_password@localhost:5432/vietlott_db" \
  -c "\COPY vietlott_results_35 (draw_date, draw_numb, number1, number2, number3, number4, number5, numberextra, created_at) TO 'vietlott_results_35.csv' WITH CSV HEADER"
```

> **Note**: We intentionally omit the `id` column so Supabase's `SERIAL` generates new IDs automatically.

This creates 3 CSV files in your current directory.

---

## Step 5: Import Data into Supabase

### Option A: Using psql CLI (Recommended for large datasets)

```sh
SUPABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.ewidfqyceqzpqdeebobp.supabase.co:5432/postgres"

# Import vietlott_results_45
psql "$SUPABASE_URL" \
  -c "\COPY vietlott_results_45 (draw_date, draw_numb, number1, number2, number3, number4, number5, number6, created_at) FROM 'vietlott_results_45.csv' WITH CSV HEADER"

# Import vietlott_results_55
psql "$SUPABASE_URL" \
  -c "\COPY vietlott_results_55 (draw_date, draw_numb, number1, number2, number3, number4, number5, number6, numberextra, created_at) FROM 'vietlott_results_55.csv' WITH CSV HEADER"

# Import vietlott_results_35
psql "$SUPABASE_URL" \
  -c "\COPY vietlott_results_35 (draw_date, draw_numb, number1, number2, number3, number4, number5, numberextra, created_at) FROM 'vietlott_results_35.csv' WITH CSV HEADER"
```

### Option B: Using Supabase Dashboard

1. Go to **Table Editor** in your Supabase dashboard
2. Select a table (e.g., `vietlott_results_45`)
3. Click **"Insert"** > **"Import data from CSV"**
4. Upload the corresponding CSV file
5. Repeat for all 3 tables

---

## Step 6: Verify the Migration

Run a quick count check on both databases:

```sh
# Local counts
psql "postgresql://vietlott_user:vietlott_password@localhost:5432/vietlott_db" \
  -c "SELECT 'results_45' as tbl, COUNT(*) FROM vietlott_results_45
      UNION ALL SELECT 'results_55', COUNT(*) FROM vietlott_results_55
      UNION ALL SELECT 'results_35', COUNT(*) FROM vietlott_results_35;"

# Supabase counts
psql "postgresql://postgres:[YOUR-PASSWORD]@db.ewidfqyceqzpqdeebobp.supabase.co:5432/postgres" \
  -c "SELECT 'results_45' as tbl, COUNT(*) FROM vietlott_results_45
      UNION ALL SELECT 'results_55', COUNT(*) FROM vietlott_results_55
      UNION ALL SELECT 'results_35', COUNT(*) FROM vietlott_results_35;"
```

The row counts should match exactly.

---

## Step 7: Reset the Serial Sequence (Important!)

Since we imported rows without the `id` column, the serial sequence may be out of sync. Fix it:

Run this in the **Supabase SQL Editor**:

```sql
SELECT setval('vietlott_results_45_id_seq', (SELECT COALESCE(MAX(id), 0) FROM vietlott_results_45));
SELECT setval('vietlott_results_55_id_seq', (SELECT COALESCE(MAX(id), 0) FROM vietlott_results_55));
SELECT setval('vietlott_results_35_id_seq', (SELECT COALESCE(MAX(id), 0) FROM vietlott_results_35));
```

---

## Step 8: Clean Up

After verifying everything works:

1. Delete the CSV export files:
   ```sh
   rm vietlott_results_45.csv vietlott_results_55.csv vietlott_results_35.csv
   ```

2. (Optional) Stop your local Docker PostgreSQL if no longer needed:
   ```sh
   docker compose down
   ```

---

## Troubleshooting

### "connection refused" when connecting to Supabase
- Check that your IP is not blocked — Supabase allows all IPs by default, but verify under **Settings** > **Database** > **Network Restrictions**

### "permission denied for table"
- Make sure you're connecting as the `postgres` user (not a custom role)

### CSV import fails with encoding errors
- Ensure your CSV files are UTF-8 encoded
- Try adding `ENCODING 'UTF8'` to the `\COPY` command

### Row counts don't match
- Check for any `UNIQUE` constraint violations during import — duplicate `draw_numb` values may have been silently skipped
- Review the psql output for error messages during the `\COPY FROM` step
