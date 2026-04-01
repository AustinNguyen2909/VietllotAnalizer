import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

/** Throws if there is no active authenticated session. Call at the top of every service function. */
export async function requireAuth(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw new Error("Unauthorized: you must be signed in to perform this action.");
  }
}
