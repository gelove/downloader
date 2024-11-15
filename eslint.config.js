import globals from "globals";
import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default [
  { files: ["**/*.{js,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  ...pluginQuery.configs["flat/recommended"],
  pluginReact.configs.flat.recommended,
  eslintConfigPrettier,
  // custom config
  {
    settings: {
      react: {
        // React version. 'detect' automatically detects the version
        version: "detect",
      },
    },
  },
  {
    ignores: [
      "node_modules",
      "dist",
      "mock",
      ".prettierrc.cjs",
      "eslint.config.js",
      "tailwind.config.ts",
      "src/components/ui/*.{jsx,tsx}",
    ],
  },
  {
    name: "custom-lint-config",
    files: ["src/**/*.{js,ts,jsx,tsx}"],
    // off 或者 0, 表示关闭规则
    // warn 或者 1， 表示开启规则，未能通过该规则时代码显示黄色的波浪线
    // error 或者 2，表示开启规则，未能通过该规则时代码显示红色的波浪线
    // global rules
    rules: {
      "react/jsx-uses-react": 0,
      "react/react-in-jsx-scope": 0,
      "@typescript-eslint/no-explicit-any": 0,
    },
  },
];
