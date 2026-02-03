import { createClient } from "@supabase/supabase-js";

// These will come from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log environment variable status (remove after setup)
console.log("🔧 Supabase Configuration Check:");
console.log("URL exists:", !!supabaseUrl);
console.log("Key exists:", !!supabaseAnonKey);
if (supabaseUrl) {
  console.log("URL starts with:", supabaseUrl.substring(0, 20) + "...");
}

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase configuration!");
  console.error("Make sure you have created .env.local file with:");
  console.error("VITE_SUPABASE_URL=your_url");
  console.error("VITE_SUPABASE_ANON_KEY=your_key");
  console.error("And restart your dev server (yarn dev)");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
