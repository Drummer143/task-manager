import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import _import from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [{
  ignores: ["**/vite.config.ts*", "dist", "node_modules"]
}, ...fixupConfigRules(compat.extends(
  "eslint:recommended",
  "plugin:react/recommended",
  "plugin:react-hooks/recommended",
  "plugin:@typescript-eslint/recommended"
)), {
  plugins: {
    react: fixupPluginRules(react),
    import: fixupPluginRules(_import),
    "react-hooks": fixupPluginRules(reactHooks),
    "@typescript-eslint": fixupPluginRules(typescriptEslint)
  },

  languageOptions: {
    globals: {
      ...globals.browser
    },

    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module"
  },

  settings: {
    react: {
      version: "detect"
    }
  },

  rules: {
    indent: ["off", "tab"],
    "react/react-in-jsx-scope": "off",
    "linebreak-style": ["error", "windows"],

    "no-console": ["warn", {
      allow: ["warn", "error", "info"]
    }],

    "comma-dangle": ["warn", "never"],

    camelcase: ["error", {
      properties: "never"
    }],

    eqeqeq: "error",

    "max-len": ["warn", {
      code: 120,
      tabWidth: 4,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreComments: true
    }],

    "max-depth": ["warn", {
      max: 4
    }],

    "max-lines": ["warn", {
      max: 200,
      skipBlankLines: true,
      skipComments: true
    }],

    "sort-imports": ["error", {
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false
    }],

    "import/order": ["error", {
      groups: [
        ["builtin", "external"],
        "internal",
        ["parent", "sibling", "index"],
        "unknown"
      ],

      pathGroups: [{
        pattern: "react",
        group: "builtin",
        position: "before"
      }, {
        pattern: "{store,pages,widgets,shared}/**",
        group: "internal"
      }, {
        pattern: "./**",
        group: "internal",
        position: "after"
      }, {
        pattern: "*.{scss,css}",
        group: "unknown",
        position: "after"
      }],

      pathGroupsExcludedImportTypes: ["builtin"],

      alphabetize: {
        order: "asc",
        caseInsensitive: true
      },

      "newlines-between": "always",
      warnOnUnassignedImports: true
    }],

    "newline-after-var": "warn",
    "no-debugger": "warn",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],

    semi: ["warn", "always", {
      omitLastInOneLineBlock: true
    }],

    quotes: ["warn", "double", {
      avoidEscape: true
    }]
  }
}];