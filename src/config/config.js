require("dotenv").config();

// Percent-encode a password so it is safe inside a postgres:// URL.
const encodePassword = (password) => encodeURIComponent(password || "");

// Builds the Supabase pooler connection string from either a ready-made URL
// (SUPABASE_DB_URL) or the individual connection parameters shown in the
// Supabase dashboard ("Shared pooler" section).
const buildSupabaseConnectionString = () => {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const { SUPABASE_DB_HOST, SUPABASE_DB_PORT, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD, SUPABASE_DB_NAME } = process.env;
  if (!SUPABASE_DB_HOST || !SUPABASE_DB_USER || !SUPABASE_DB_PASSWORD) return null;
  const host = SUPABASE_DB_HOST;
  const port = SUPABASE_DB_PORT || 6543;
  const database = SUPABASE_DB_NAME || "postgres";
  return `postgresql://${SUPABASE_DB_USER}:${encodePassword(SUPABASE_DB_PASSWORD)}@${host}:${port}/${database}`;
};

module.exports = {
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "vietlott_user",
    password: process.env.DB_PASSWORD || "vietlott_password",
    database: process.env.DB_NAME || "vietlott_db",
  },
  supabase: {
    connectionString: buildSupabaseConnectionString(),
    // The Supabase pooler terminates TLS with a cert node-postgres does not
    // ship a root for, so verification is disabled (the connection is still
    // encrypted).
    ssl: { rejectUnauthorized: false },
  },
  encodePassword,
  buildSupabaseConnectionString,
};
