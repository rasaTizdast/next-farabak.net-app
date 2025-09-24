import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Import plugins separately to avoid duplicate loading
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  // Extend Next.js ESLint configuration
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Prettier plugin
  ...compat.extends("prettier"),

  {
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      prettier: prettierPlugin,
    },
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unsafe-function-type": "off",

      // React specific rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "off", // Disable rules of hooks warning
      "react-hooks/exhaustive-deps": "off", // Disable exhaustive deps warning
      "@next/next/no-img-element": "off", // Allow img elements

      // General rules
      "no-console": "off", // Allow console statements
      "no-duplicate-imports": "error",

      // Prettier integration
      "prettier/prettier": ["error", {}],

      // Import sorting
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling"], "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
];

export default eslintConfig;
