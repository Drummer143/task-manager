import { Preview } from "@storybook/react";
import { App, Layout } from "antd";
import "antd/dist/reset.css";
import { ThemeProvider } from "antd-style";

const preview: Preview = {
	decorators: [
		(Story, { parameters }) => {
			const theme = (parameters as { theme: "dark" | "light" }).theme;

			return (
				<ThemeProvider
					theme={{ cssVar: true }}
					themeMode={theme === "dark" ? "dark" : "light"}
				>
					<App>
						<Layout style={{ width: "80vw", height: "80vh", padding: "20px" }}>
							<Story />
						</Layout>
					</App>
				</ThemeProvider>
			);
		}
	]
};

export default preview;

