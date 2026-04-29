import { inject } from "@angular/core";
import { OidcSecurityService } from "angular-auth-oidc-client";
import { map, take } from "rxjs";

export const authGuard = () => {
	const oidc = inject(OidcSecurityService);

	return oidc.isAuthenticated$.pipe(
		take(1),
		map(({ isAuthenticated }: { isAuthenticated: boolean }) => {
			if (!isAuthenticated) {
				oidc.authorize();
				return false;
			}

			return true;
		})
	);
};
