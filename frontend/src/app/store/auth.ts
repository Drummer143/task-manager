import api from "api";
import { create } from "zustand";

interface authState {
	user?: User

	getSession: () => Promise<void>
}

export const useAuthStore = create<authState>((set) => ({
	getSession: async () => {
		let user: User | undefined = undefined;

		try {
			user = await api.profile.get();
		} catch { /* empty */ }

		set({ user });
	}
}));