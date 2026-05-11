/**
 * Simple test script to validate Strava API credentials
 * Run with: node scripts/test-strava-credentials.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};

envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/\r$/, "");
  }
});

// Make them available as process.env
Object.assign(process.env, env);

const CHECKS = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function log(type, message) {
  const symbols = {
    pass: "✅",
    fail: "❌",
    warn: "⚠️",
    info: "ℹ️",
  };
  console.log(`${symbols[type]} ${message}`);
}

console.log("\n🔍 Strava API Credentials Validation\n");
console.log("═".repeat(50) + "\n");

// Check 1: Client ID exists
const clientId = process.env.VITE_STRAVA_CLIENT_ID;
if (clientId && clientId.trim().length > 0) {
  log("pass", "Client ID is present");
  CHECKS.passed++;
} else {
  log("fail", "Client ID is missing or empty");
  CHECKS.failed++;
}

// Check 2: Client ID format (should be numeric)
if (clientId && /^\d+$/.test(clientId.trim())) {
  log("pass", "Client ID format looks correct (numeric)");
  CHECKS.passed++;
} else if (clientId) {
  log("warn", "Client ID should be numeric - double check it");
  CHECKS.warnings++;
}

// Check 3: Client Secret exists
const clientSecret = process.env.VITE_STRAVA_CLIENT_SECRET;
if (clientSecret && clientSecret.trim().length > 0) {
  log("pass", "Client Secret is present");
  CHECKS.passed++;
} else {
  log("fail", "Client Secret is missing or empty");
  CHECKS.failed++;
}

// Check 4: Client Secret format (should be 40 hex characters)
if (clientSecret && /^[a-f0-9]{40}$/.test(clientSecret.trim())) {
  log("pass", "Client Secret format looks correct (40 hex characters)");
  CHECKS.passed++;
} else if (clientSecret) {
  log(
    "warn",
    "Client Secret should be 40 hexadecimal characters - double check it",
  );
  CHECKS.warnings++;
}

// Check 5: Redirect URI exists
const redirectUri = process.env.VITE_STRAVA_REDIRECT_URI;
if (redirectUri && redirectUri.trim().length > 0) {
  log("pass", "Redirect URI is present");
  CHECKS.passed++;
} else {
  log("warn", "Redirect URI is missing (added automatically)");
  CHECKS.warnings++;
}

// Check 6: Redirect URI format
if (
  redirectUri &&
  (redirectUri.startsWith("http://") || redirectUri.startsWith("https://"))
) {
  log("pass", "Redirect URI format looks correct");
  CHECKS.passed++;
} else if (redirectUri) {
  log("fail", "Redirect URI should start with http:// or https://");
  CHECKS.failed++;
}

console.log("\n" + "═".repeat(50));

// Generate authorization URL as a test
if (clientId && clientSecret) {
  console.log("\n📝 Generated OAuth Authorization URL:\n");
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri || "http://localhost:5173/strava/callback")}&approval_prompt=force&scope=activity:read_all`;
  console.log(authUrl);
  console.log(
    "\n💡 You can test this URL in your browser (after implementing the callback handler)",
  );
}

// Summary
console.log("\n" + "═".repeat(50));
console.log("\n📊 Summary:");
console.log(`   ✅ Passed: ${CHECKS.passed}`);
console.log(`   ⚠️  Warnings: ${CHECKS.warnings}`);
console.log(`   ❌ Failed: ${CHECKS.failed}`);

if (CHECKS.failed === 0 && CHECKS.warnings === 0) {
  console.log(
    "\n🎉 All checks passed! Your Strava credentials are set up correctly.",
  );
} else if (CHECKS.failed === 0) {
  console.log("\n✓ Setup looks good with minor warnings.");
} else {
  console.log("\n⚠️  Please fix the failed checks before proceeding.");
}

console.log("\n" + "═".repeat(50) + "\n");
