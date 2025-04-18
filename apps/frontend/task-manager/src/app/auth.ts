import { UserManager, UserManagerSettings } from "oidc-client-ts";

const oidcConfig: UserManagerSettings = {
	authority: "http://localhost:6088",
	client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
	redirect_uri: `${window.location.origin}/callback`,
	post_logout_redirect_uri: `${window.location.origin}/logout`,
	response_type: "code",
	scope: "openid profile email",
	loadUserInfo: true,
	automaticSilentRenew: true,
	monitorSession: true
};

export const userManager = new UserManager(oidcConfig);

