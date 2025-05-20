import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";
// Create a single supabase client for interacting with your database

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided");
}

function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
