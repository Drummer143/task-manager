import { getProfile, User, Workspace } from "@task-manager/api";
import { User as OidcUser } from "oidc-client-ts";
import { create } from "zustand";

import { userManager } from "../userManager";

type GetSessionResponse = {
	user: User & { workspace: Workspace };
	identity: OidcUser;
};

interface AuthState {
	user: User & { workspace: Workspace };
	loading: boolean;
	identity: OidcUser;

	getSession: () => Promise<GetSessionResponse>;
}

let promise: Promise<GetSessionResponse> | undefined = undefined;

export const useAuthStore = create<AuthState>((set, get) => ({
	loading: false,

	user: undefined as unknown as User & { workspace: Workspace },

	identity: undefined as unknown as OidcUser,

	getSession: async () => {
		if (promise) {
			return promise;
		}

		const { loading, user, identity } = get();

		if (loading && user) {
			return { user, identity };
		}

		set({ loading: true });

		try {
			promise = Promise.all([getProfile(), userManager.getUser()]).then(
				([user, identity]) => {
					if (!identity) {
						throw new Error("Failed to get user profile");
					}

					return { user, identity };
				}
			);

			const data = await promise;

			set(data);

			return data;
		} finally {
			set({ loading: false });

			promise = undefined;
		}
	}
}));

