import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideAuth } from "angular-auth-oidc-client";
import Aura from "@primeng/themes/aura";
import { providePrimeNG } from "primeng/config";

import { authInterceptor } from "./auth/auth.interceptor";
import { authConfig } from "./auth/auth.config";
import { appRoutes } from "./app.routes";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(appRoutes, withComponentInputBinding()),
		provideHttpClient(withInterceptors([authInterceptor])),
		provideAnimationsAsync(),
		provideAuth(authConfig),
		providePrimeNG({
			theme: {
				preset: Aura,
				options: {
					darkModeSelector: ".dark-mode"
				}
			}
		})
	]
};
