import { PassedInitialConfig } from "angular-auth-oidc-client";

import { environment } from "../../environments/environment";

export const authConfig: PassedInitialConfig = {
	config: {
		authority: environment.authority,
		redirectUrl: environment.redirectUri,
		postLogoutRedirectUri: environment.postLogoutRedirectUri,
		clientId: environment.clientId,
		scope: "openid profile email offline_access",
		responseType: "code",
		silentRenew: true,
		useRefreshToken: true,
		silentRenewTimeoutInSeconds: 5,
		renewTimeBeforeTokenExpiresInSeconds: 30,
		secureRoutes: ["/api", "/storage"]
	}
};
