import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { OidcSecurityService } from "angular-auth-oidc-client";
import { switchMap, take } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const oidc = inject(OidcSecurityService);

	const secureRoutes = ["/api", "/storage"];
	const isSecure = secureRoutes.some(route => req.url.startsWith(route));

	if (!isSecure) {
		return next(req);
	}

	return oidc.getAccessToken().pipe(
		take(1),
		switchMap((token: string) => {
			if (!token) {
				return next(req);
			}

			const authedReq = req.clone({
				setHeaders: {
					Authorization: `Bearer ${token}`
				}
			});

			return next(authedReq);
		})
	);
};
