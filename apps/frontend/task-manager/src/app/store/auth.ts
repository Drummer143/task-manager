import { getProfile, User, Workspace } from "@task-manager/api";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface authState {
	loading: boolean;

	clear: () => void;
	getSession: () => Promise<(User & { workspace: Workspace }) | undefined | void>;
	setSession: (user: User & { workspace: Workspace }) => void;

	user: User & { workspace: Workspace };
}

let promise: Promise<(User & { workspace: Workspace }) | undefined> | undefined = undefined;

export const useAuthStore = create<authState>()(
	devtools(
		(set, get) => ({
			loading: false,

			user: undefined as unknown as (User & { workspace: Workspace }),

			clear: () => set({ user: undefined, loading: false }),

			setSession: user => set({ user, loading: false }),

			getSession: async () => {
				if (promise) {
					return promise;
				}

				const { loading, user: existingUser } = get();

				if (loading || existingUser) {
					return existingUser;
				}

				set({ loading: true });

				let user: (User & { workspace: Workspace }) | undefined = undefined;

				try {
					if (document.cookie) {
						user = await getProfile({ includes: ["workspace"] });
					}
				} catch {
					/* empty */
				}

				set({ user, loading: false });

				promise = undefined;

				return user;
			}
		}),
		{ name: "auth-store" }
	)
);