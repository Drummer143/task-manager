import api from "api";
import { create } from "zustand";

interface authState {
	user?: User

	getSession: () => Promise<boolean>
}

export const useAuthStore = create<authState>((set) => ({
	getSession: async () => {
		try {
			const user = await api.profile.get();

			set({ user });

			return true;
		} catch {
			set({ user: undefined });

			return false;
		}
	}
}));