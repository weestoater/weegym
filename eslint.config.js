import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist",
    "coverage",
    "docs/**/*.js",
    "docs/**/*.jsx",
    "supabase-config/**/*.js",
  ]),
  // Main source files - browser environment
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        __APP_VERSION__: "readonly", // Vite global
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" },
      ],
      "react-hooks/purity": "warn", // Downgrade to warning - some legitimate cases need Date.now()
      "react-hooks/set-state-in-effect": "warn", // Allow for legitimate cases like localStorage init
      "react-refresh/only-export-components": "warn", // Allow non-component exports (like contexts)
    },
  },
  // Node.js scripts and config files
  {
    files: [
      "scripts/**/*.js",
      "vite.config.js",
      "vitest.config.js",
      "commitlint.config.js",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  // Test files
  {
    files: ["src/test/**/*.{js,jsx}", "**/*.test.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        vi: "readonly",
        global: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
  },
]);
