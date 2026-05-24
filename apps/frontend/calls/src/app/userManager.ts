import { UserManager } from "oidc-client-ts";

export const userManager = new UserManager({
	authority: import.meta.env.VITE_AUTHORITY,
	client_id: import.meta.env.VITE_CLIENT_ID,
	redirect_uri: `${window.location.origin}/callback`,
	silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
	response_type: "code",
	scope: "openid profile email offline_access",
	automaticSilentRenew: true,
	silentRequestTimeoutInSeconds: 5
	// post_logout_redirect_uri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI
});
