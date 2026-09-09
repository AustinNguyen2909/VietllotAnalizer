/**
 * Migrates the local Postgres (docker `vietlott_db`) into a Supabase project.
 *
 *   node scripts/migrateToSupabase.js [options]
 *
 * Options:
 *   --tables=45,55,35   only migrate these products (default: all three)
 *   --batch=500         rows per INSERT batch (default 500)
 *   --truncate          empty the Supabase tables before copying
 *   --schema-only       create the tables on Supabase, copy nothing
 *   --check             only test both connections and print row counts
 *   --dry-run           read from local + report, write nothing
 *   --url=<conn string> override the Supabase connection string for this run
 *
 * Connection comes from .env — see .env.example.
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const config = require("../src/config/config");

const TABLES = {
  45: {
    name: "vietlott_results_45",
    columns: ["id", "draw_date", "draw_numb", "number1", "number2", "number3", "number4", "number5", "number6", "created_at"],
  },
  55: {
    name: "vietlott_results_55",
    columns: ["id", "draw_date", "draw_numb", "number1", "number2", "number3", "number4", "number5", "number6", "numberextra", "created_at"],
  },
  35: {
    name: "vietlott_results_35",
    columns: ["id", "draw_date", "draw_numb", "number1", "number2", "number3", "number4", "number5", "numberextra", "created_at"],
  },
};

const parseArgs = (argv) => {
  const args = { tables: Object.keys(TABLES), batch: 500, truncate: false, schemaOnly: false, check: false, dryRun: false, url: null };
  for (const arg of argv) {
    if (arg.startsWith("--tables=")) args.tables = arg.split("=")[1].split(",").map((t) => t.trim()).filter(Boolean);
    else if (arg.startsWith("--batch=")) args.batch = Number(arg.split("=")[1]) || args.batch;
    else if (arg === "--truncate") args.truncate = true;
    else if (arg === "--schema-only") args.schemaOnly = true;
    else if (arg === "--check") args.check = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg.startsWith("--url=")) args.url = arg.slice("--url=".length);
    else throw new Error(`Unknown option: ${arg}`);
  }
  const unknown = args.tables.filter((t) => !TABLES[t]);
  if (unknown.length) throw new Error(`Unknown table key(s): ${unknown.join(", ")} (valid: 45, 55, 35)`);
  return args;
};

// Reuses db/migrations/001_init.up.sql as the single source of truth for the
// schema, made re-runnable so it is safe to apply to Supabase repeatedly.
const idempotentSchemaSql = () => {
  const file = path.join(__dirname, "..", "db", "migrations", "001_init.up.sql");
  return fs.readFileSync(file, "utf8").replace(/CREATE TABLE (?!IF NOT EXISTS)/gi, "CREATE TABLE IF NOT EXISTS ");
};

const rowCount = async (client, table) => {
  const res = await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
  return res.rows[0].count;
};

const copyTable = async (source, target, { name, columns }, batchSize, dryRun) => {
  const { rows } = await source.query(`SELECT ${columns.join(", ")} FROM ${name} ORDER BY id ASC`);
  if (!rows.length) {
    console.log(`  ${name}: local table is empty, nothing to copy`);
    return 0;
  }
  if (dryRun) {
    console.log(`  ${name}: would copy ${rows.length} row(s)`);
    return 0;
  }

  let inserted = 0;
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize);
    const values = [];
    const placeholders = batch.map((row, rowIndex) => {
      const group = columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`);
      values.push(...columns.map((col) => row[col]));
      return `(${group.join(", ")})`;
    });
    // id is carried over so local and Supabase rows stay comparable; re-running
    // the migration is therefore a no-op instead of a duplicate.
    const query = `INSERT INTO ${name} (${columns.join(", ")}) VALUES ${placeholders.join(", ")} ON CONFLICT (id) DO NOTHING`;
    const res = await target.query(query, values);
    inserted += res.rowCount;
    console.log(`  ${name}: ${Math.min(offset + batch.length, rows.length)}/${rows.length} processed (${inserted} inserted)`);
  }

  // Keep the SERIAL sequence ahead of the copied ids, otherwise the first
  // insert made by the app on Supabase collides on the primary key.
  await target.query(`SELECT setval(pg_get_serial_sequence('${name}', 'id'), GREATEST((SELECT MAX(id) FROM ${name}), 1))`);
  return inserted;
};

const main = async () => {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const connectionString = args.url || config.supabase.connectionString;
  if (!connectionString) {
    console.error("Missing Supabase credentials. Set SUPABASE_DB_URL (or SUPABASE_DB_HOST / _USER / _PASSWORD) in .env — see .env.example.");
    process.exit(1);
  }

  const source = new Client(config.db);
  const target = new Client({ connectionString, ssl: config.supabase.ssl });

  try {
    await source.connect();
    console.log(`Connected to local Postgres ${config.db.host}:${config.db.port}/${config.db.database}`);
    await target.connect();
    const { rows: who } = await target.query("SELECT current_database() AS db, current_user AS usr, version()");
    console.log(`Connected to Supabase ${who[0].db} as ${who[0].usr}`);

    if (!args.check) {
      console.log("Applying schema to Supabase...");
      await target.query(idempotentSchemaSql());
    }

    for (const key of args.tables) {
      const table = TABLES[key];
      const localCount = await rowCount(source, table.name);

      if (args.check) {
        console.log(`${table.name}: local=${localCount} supabase=${await rowCount(target, table.name)}`);
        continue;
      }
      if (args.schemaOnly) {
        console.log(`${table.name}: schema ready (local has ${localCount} row(s))`);
        continue;
      }

      console.log(`Migrating ${table.name} (${localCount} local row(s))...`);
      if (args.truncate && !args.dryRun) {
        await target.query(`TRUNCATE ${table.name} RESTART IDENTITY`);
        console.log(`  ${table.name}: truncated on Supabase`);
      }
      const inserted = await copyTable(source, target, table, args.batch, args.dryRun);
      if (!args.dryRun) {
        console.log(`  ${table.name}: done — inserted ${inserted}, Supabase now holds ${await rowCount(target, table.name)} row(s)`);
      }
    }
  } catch (err) {
    // Connection failures often surface as an AggregateError (one error per
    // resolved address) whose own message is empty, so unwrap it.
    const detail = [err.message, err.code && `code=${err.code}`]
      .concat(err.errors ? err.errors.map((e) => `${e.code || ""} ${e.message}`.trim()) : [])
      .filter(Boolean)
      .join(" | ");
    console.error("Migration failed:", detail || err);
    process.exitCode = 1;
  } finally {
    await source.end().catch(() => {});
    await target.end().catch(() => {});
  }
};

main();
