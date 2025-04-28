import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import nx from "@nx/eslint-plugin";
import { dirname } from "path";
import { fileURLToPath } from "url";

import baseConfig from "../../../eslint.config.mjs";

const compat = new FlatCompat({
	baseDirectory: dirname(fileURLToPath(import.meta.url)),
	recommendedConfig: js.configs.recommended
});

const nextConfig = fixupConfigRules(compat.extends("next"));
const nextCoreConfig = fixupConfigRules(compat.extends("next/core-web-vitals"));

nextConfig.concat(nextCoreConfig).forEach(c => {
	if (c.plugins?.react) {
		delete c.plugins.react;
	}

	if (c.plugins?.["react-hooks"]) {
		delete c.plugins["react-hooks"];
	}

	if (c.plugins?.import) {
		delete c.plugins.import;
	}
});

// eslint-disable-next-line import/no-anonymous-default-export
export default [
	...nextConfig,
	...nextCoreConfig,
	...baseConfig,
	...nx.configs["flat/react-typescript"],
	{
		ignores: [".next/**/*"]
	}
];