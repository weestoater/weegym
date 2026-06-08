/**
 * Strava Configuration Checker
 * Verifies that all required environment variables are properly set
 * Run with: npm run strava:check-config
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

// Load .env file manually
function loadEnvFile(filename) {
  try {
    const envPath = resolve(rootDir, filename);
    const content = readFileSync(envPath, "utf-8");
    const env = {};

    content.split("\n").forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join("=").trim();
        }
      }
    });

    return env;
  } catch (err) {
    return null;
  }
}

// Try to load environment variables from different sources
let env = loadEnvFile(".env") || {};
const envDev = loadEnvFile(".env.development");
const envLocal = loadEnvFile(".env.local");

// Merge in order of precedence: .env.local > .env.development > .env
if (envDev) env = { ...env, ...envDev };
if (envLocal) env = { ...env, ...envLocal };

const REQUIRED_ENV_VARS = [
  "VITE_STRAVA_CLIENT_ID",
  "VITE_STRAVA_CLIENT_SECRET",
  "VITE_STRAVA_REDIRECT_URI",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(color, ...args) {
  console.log(color, ...args, COLORS.reset);
}

console.log("\n" + "=".repeat(60));
log(COLORS.cyan, "🔍 Strava Configuration Check");
console.log("=".repeat(60) + "\n");

let hasErrors = false;
let hasWarnings = false;

// Check required environment variables
REQUIRED_ENV_VARS.forEach((varName) => {
  const value = env[varName];

  if (!value) {
    log(COLORS.red, `❌ MISSING: ${varName}`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    let displayValue = value;
    if (varName.includes("SECRET") || varName.includes("KEY")) {
      displayValue = "***" + value.slice(-4);
    }
    log(COLORS.green, `✅ ${varName}:`, displayValue);
  }
});

console.log("\n" + "-".repeat(60));

// Check redirect URI format
const redirectUri = env.VITE_STRAVA_REDIRECT_URI;
if (redirectUri) {
  console.log("\n🔗 Redirect URI Analysis:");

  if (redirectUri.includes("localhost") || redirectUri.includes("127.0.0.1")) {
    log(COLORS.yellow, "⚠️  Using localhost - this is for DEVELOPMENT only");
    hasWarnings = true;
  } else {
    log(COLORS.green, "✅ Using production URL");
  }

  if (redirectUri.endsWith("/strava/callback")) {
    log(COLORS.green, "✅ Redirect path looks correct (/strava/callback)");
  } else if (redirectUri.endsWith("/strava-callback")) {
    log(
      COLORS.yellow,
      "⚠️  Using /strava-callback - app expects /strava/callback",
    );
    log(COLORS.yellow, "   Update VITE_STRAVA_REDIRECT_URI or App.jsx route");
    hasWarnings = true;
  } else {
    log(COLORS.red, "❌ Redirect path may be incorrect");
    log(COLORS.red, "   Expected to end with /strava/callback");
    hasErrors = true;
  }

  // Check protocol
  if (redirectUri.startsWith("http://") && !redirectUri.includes("localhost")) {
    log(COLORS.yellow, "⚠️  Using HTTP (not HTTPS) for production");
    log(COLORS.yellow, "   Strava requires HTTPS for production OAuth");
    hasWarnings = true;
  }
}

// Check client ID format
const clientId = env.VITE_STRAVA_CLIENT_ID;
if (clientId && !/^\d+$/.test(clientId)) {
  log(COLORS.yellow, "⚠️  Client ID should be numeric");
  hasWarnings = true;
}

// Check client secret format
const clientSecret = env.VITE_STRAVA_CLIENT_SECRET;
if (clientSecret && clientSecret.length < 20) {
  log(COLORS.yellow, "⚠️  Client secret seems too short (expected 40 chars)");
  hasWarnings = true;
}

console.log("\n" + "=".repeat(60));

// Summary
if (hasErrors) {
  log(
    COLORS.red,
    "\n❌ Configuration has ERRORS - Strava integration will NOT work",
  );
  log(COLORS.cyan, "\nTo fix:");
  console.log(
    "1. Copy .env.example to .env (or .env.local for local overrides)",
  );
  console.log("2. Fill in the missing values from Strava API settings");
  console.log("3. Ensure VITE_STRAVA_REDIRECT_URI matches your App.jsx route");
  console.log("4. Restart dev server after changing .env files");
  process.exit(1);
} else if (hasWarnings) {
  log(COLORS.yellow, "\n⚠️  Configuration has warnings - please review");
  process.exit(0);
} else {
  log(COLORS.green, "\n✅ Configuration looks good!");
  log(COLORS.cyan, "\nNext steps:");
  console.log("1. Verify redirect URI in Strava API settings matches:");
  console.log(`   ${redirectUri}`);
  console.log("2. Test the OAuth flow by connecting your Strava account");
  console.log("3. Check browser console for detailed logs during sync");
  process.exit(0);
}
