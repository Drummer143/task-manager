import { ThemeConfig } from "antd";

import { darkExtra } from "./extraToken";

export default {
	cssVar: true,
	components: {
		Layout: {
			triggerBg: "#080808",
			headerBg: "#040404",
			siderBg: "#040404"
		}
	},
	token: darkExtra
} as Omit<ThemeConfig, "algorithm">;