import { ThemeConfig } from "antd";

export default {
	cssVar: true,
	components: {
		Layout: {
			triggerBg: "#080808",
			headerBg: "#040404",
			siderBg: "#040404"
		}
	}
} as Omit<ThemeConfig, "algorithm">;
