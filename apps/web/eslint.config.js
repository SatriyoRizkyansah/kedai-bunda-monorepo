import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslintPackage from "typescript-eslint";

const tseslint = tseslintPackage?.default ?? tseslintPackage;
const tsConfigs = tseslint?.configs;

export default [
  {
    ignores: ["dist"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tsConfigs?.recommended ?? [], reactHooks.configs.flat.recommended, reactRefresh.configs.vite].flat(),
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
];
