// eslint.config.mjs
import eslint from "@eslint/js";                             // JS core rules :contentReference[oaicite:9]{index=9}
import tseslint from "typescript-eslint";                    // TS plugin & configs :contentReference[oaicite:10]{index=10}
import globals from "globals";                              // Browser/Node globals :contentReference[oaicite:11]{index=11}
import { defineConfig } from "eslint/config";               // Flat‐config helper :contentReference[oaicite:12]{index=12}

export default defineConfig([
  // 1. Core ESLint recommended (JS)
  eslint.configs.recommended,

  // 2. TypeScript-ESLint recommended (TS)
  tseslint.configs.recommended,

  // 3. Global variables (e.g., browser)
  {
    files: ["**/*.{js,mjs,cjs,ts,cts,mts}"],
    languageOptions: { globals: globals.browser },
  },

  // 4. Any custom overrides
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // …your other TS-specific rules
    },
  },
]);
