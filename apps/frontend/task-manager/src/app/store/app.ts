import { devtools, persist } from "zustand/middleware";
import { create } from "zustand/react";

interface AppState {
	theme: "light" | "dark";

	setTheme: (theme: "light" | "dark") => void;
	toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
	devtools(
		persist(
			set => ({
				theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",

				setTheme: theme => set({ theme }),

				toggleTheme: () => set(state => ({ theme: state.theme === "light" ? "dark" : "light" })),

			}),
			{ name: "app-store" }
		),
		{ enabled: import.meta.env.DEV, name: "app-store" }
	)
);