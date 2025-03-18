import { getProfile } from "api";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface authState {
	loading: boolean;

	clear: () => void;
	getSession: () => Promise<void>;
	setSession: (user: User) => void;

	user?: User;
}

export const useAuthStore = create<authState>()(
	devtools(
		set => ({
			loading: false,

			clear: () => set({ user: undefined, loading: false }),

			setSession: user => set({ user, loading: false }),

			getSession: async () => {
				set({ loading: true });

				let user: User | undefined = undefined;

				try {
					if (document.cookie) {
						user = await getProfile();
					}
				} catch {
					/* empty */
				}

				set({ user, loading: false });
			}
		}),
		{ name: "auth-store" }
	)
);
