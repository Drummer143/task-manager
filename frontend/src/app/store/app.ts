import { devtools, persist } from "zustand/middleware";
import { create } from "zustand/react";

interface AppState {
	theme?: "light" | "dark";
	workspaceId?: string;

	setTheme: (theme: "light" | "dark") => void;
	toggleTheme: () => void;
	setWorkspaceId: (workspaceId: string) => void;
}

export const useAppStore = create<AppState>()(
	devtools(
		persist(
			set => ({
				setTheme: theme => set({ theme }),

				toggleTheme: () => set(state => ({ theme: state.theme === "light" ? "dark" : "light" })),

				setWorkspaceId: workspaceId => set({ workspaceId })
			}),
			{ name: "app-store" }
		),
		{ enabled: import.meta.env.DEV, name: "app-store" }
	)
);
