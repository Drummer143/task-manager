import { ThemeConfig } from "antd";

import { lightExtra } from "./extraTokenColors";

export default {
	cssVar: true,
	components: {
		Layout: {
			triggerColor: "#000",
			triggerBg: "#f5f5f5",
			headerBg: "#fafafa",
			siderBg: "#fafafa"
		}
	},
	token: {
		...lightExtra,
		colorBgLayout: "#fff"
	}
} as Omit<ThemeConfig, "algorithm">;
