import { persist } from "zustand/middleware";
import { create } from "zustand/react";

interface AppState {
	setTheme: (theme: "light" | "dark") => void;
	toggleTheme: () => void;

	theme?: "light" | "dark";
}

export const useAppStore = create<AppState>()(
	persist(
		set => ({
			setTheme: theme => set({ theme }),

			toggleTheme: () => set(state => ({ theme: state.theme === "light" ? "dark" : "light" }))
		}),
		{
			name: "app-store"
		}
	)
);
