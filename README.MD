# Vietlott Analyzer (Node.js Version)

Vietlott Analyzer is a Node.js application that fetches Vietlott (lottery) draw results from an online API, stores them in a PostgreSQL database, and allows for later analysis.

## Features
✅ Fetch Vietlott draw results automatically  
✅ Store results in PostgreSQL  
✅ Easily deployable using Docker  
✅ Ready for data analysis  

---

## 🚀 Getting Started

### **1. Prerequisites**
- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

---

### **2. Installation**
#### **Clone the repository**

## Exporting and importing the database

The local database has three tables: `vietlott_results_35` (870 rows),
`vietlott_results_45` (1,559 rows), and `vietlott_results_55` (1,394 rows).

The generated files in `exports/` are:

- `vietlott_supabase.sql` — INSERT-based SQL suitable for Supabase SQL Editor.
- `vietlott_full.sql` — standard PostgreSQL dump using `COPY`, suitable for `psql`.

Both include the schema, all rows, primary keys, and sequence values.

### Manual import through Supabase SQL Editor

1. Rotate the database password if it has ever been shared, then update `.env`.
2. Open Supabase Dashboard → **SQL Editor** → **New query**.
3. Open `exports/vietlott_supabase.sql`, paste it into the query, and click **Run**.
4. The dump contains `DROP` statements, so do not run it against tables you need to preserve.
5. Verify the counts:

```sql
select 'vietlott_results_35' as table_name, count(*) from public.vietlott_results_35
union all
select 'vietlott_results_45', count(*) from public.vietlott_results_45
union all
select 'vietlott_results_55', count(*) from public.vietlott_results_55;
```

Expected counts are 870, 1,559, and 1,394. If SQL Editor rejects the query size,
use `psql` below. Do not paste `vietlott_full.sql` into SQL Editor because its
`COPY ... FROM stdin` sections are intended for `psql`.

### Import with `psql`

Copy the connection string from Supabase Dashboard → **Connect** → **Direct
connection** or **Session pooler**, then run:

```sh
psql "postgresql://USER:PASSWORD@HOST:PORT/postgres?sslmode=require" \\
  --file=exports/vietlott_full.sql
```

The existing direct migration is also available after setting Supabase
credentials in `.env`:

```sh
npm run db:check
npm run db:migrate
```

`db:migrate` creates the schema and copies rows without duplicating existing
IDs. You can use `--dry-run` first:

```sh
node scripts/migrateToSupabase.js --dry-run
```

The running application now uses the Supabase connection in `.env` for both
fetching existing results and inserting new results. The local PostgreSQL
settings are only used as the source by the migration script. Start the app
with:

```sh
npm start
```
