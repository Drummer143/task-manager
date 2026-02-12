import nx from "@nx/eslint-plugin";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...nx.configs["flat/base"],
	...nx.configs["flat/typescript"],
	...nx.configs["flat/javascript"],
	{
		ignores: ["**/dist", "**/vite.config.*.timestamp*", "**/vitest.config.*.timestamp*", "**/e2e/**"]
	},
	{
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
		rules: {
			"@nx/enforce-module-boundaries": [
				"error",
				{
					enforceBuildableLibDependency: true,
					allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?js$"],
					depConstraints: [
						{
							sourceTag: "*",
							onlyDependOnLibsWithTags: ["*"]
						}
					]
				}
			]
		}
	},
	{
		files: [
			"**/*.ts",
			"**/*.tsx",
			"**/*.cts",
			"**/*.mts",
			"**/*.js",
			"**/*.jsx",
			"**/*.cjs",
			"**/*.mjs"
		],
		plugins: {
			react,
			import: _import,
			"react-hooks": reactHooks,
			"@typescript-eslint": typescriptEslint
		},
		// Override or add rules here
		rules: {
			indent: ["off", "tab"],
			"react/react-in-jsx-scope": "off",
			"linebreak-style": ["error", "unix"],

			"no-console": [
				"warn",
				{
					allow: ["warn", "error", "info"]
				}
			],

			"comma-dangle": ["warn", "never"],

			camelcase: [
				"error",
				{
					properties: "never"
				}
			],

			eqeqeq: "error",

			"max-len": [
				"warn",
				{
					code: 100,
					tabWidth: 4,
					ignoreUrls: true,
					ignoreStrings: true,
					ignoreComments: true
				}
			],

			"max-depth": [
				"warn",
				{
					max: 4
				}
			],

			"max-lines": [
				"warn",
				{
					max: 200,
					skipBlankLines: true,
					skipComments: true
				}
			],

			"sort-imports": [
				"error",
				{
					ignoreCase: true,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false
				}
			],

			"import/order": [
				"error",
				{
					groups: [
						["builtin", "external"],
						"internal",
						["parent", "sibling", "index"],
						"unknown"
					],

					pathGroups: [
						{
							pattern: "react",
							group: "builtin",
							position: "before"
						},
						{
							pattern: "{store,pages,widgets,shared}/**",
							group: "internal"
						},
						{
							pattern: "./**",
							group: "internal",
							position: "after"
						},
						{
							pattern: "*.{scss,css}",
							group: "unknown",
							position: "after"
						}
					],

					pathGroupsExcludedImportTypes: ["builtin"],

					alphabetize: {
						order: "asc",
						caseInsensitive: true
					},

					"newlines-between": "always",
					warnOnUnassignedImports: true
				}
			],

			"newline-after-var": "warn",
			"no-debugger": "warn",
			"no-dupe-keys": "error",
			"no-duplicate-case": "error",
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "error",
			"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],

			semi: [
				"warn",
				"always",
				{
					omitLastInOneLineBlock: true
				}
			],

			quotes: [
				"warn",
				"double",
				{
					avoidEscape: true
				}
			]
		}
	},
	{
		files: ["**/*.test.ts", "**/*.test.tsx"],
		rules: {
			"@nx/enforce-module-boundaries": "off"
		}
	}
];
