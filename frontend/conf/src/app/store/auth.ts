import api from "api";
import { create } from "zustand";

interface authState {
	loading: boolean;

	clear: () => void;
	getSession: () => Promise<User | undefined>;

	user?: User;
}

export const useAuthStore = create<authState>(set => ({
	loading: false,

	clear: () => set({ user: undefined, loading: false }),

	getSession: async () => {
		set({ loading: true });

		let user: User | undefined = undefined;

		try {
			user = await api.profile.get();
		} catch { /* empty */ }

		set({ user, loading: false });

		return user;
	}
}));
