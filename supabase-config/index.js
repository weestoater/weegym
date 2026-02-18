/**
 * WeeGym Supabase Configuration Package
 * Main entry point - exports all modules
 */

// Export client creation functions
export {
  createSupabaseClient,
  getSupabaseClient,
  resetSupabaseClient,
  createSupabaseClientFromEnv,
} from "./client.js";

// Export configuration utilities
export {
  validateConfig,
  loadConfigFromEnv,
  createConfig,
  debugConfig,
} from "./config.js";

// Export database service factory
export { createDatabaseService } from "./database.js";

// Export auth service factory
export { createAuthService } from "./auth.js";

// Re-export default for convenience
export { default as getSupabase } from "./client.js";
export { default as createDatabase } from "./database.js";
export { default as createAuth } from "./auth.js";
