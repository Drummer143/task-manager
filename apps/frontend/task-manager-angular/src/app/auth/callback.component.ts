import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { OidcSecurityService } from "angular-auth-oidc-client";

@Component({
	selector: "app-callback",
	template: `<p>Logging in...</p>`,
	standalone: true
})
export class CallbackComponent implements OnInit {
	private readonly oidc = inject(OidcSecurityService);
	private readonly router = inject(Router);

	ngOnInit(): void {
		this.oidc.checkAuth().subscribe(({ isAuthenticated }) => {
			const returnTo = sessionStorage.getItem("auth_return_to") || "/";

			sessionStorage.removeItem("auth_return_to");

			this.router.navigateByUrl(isAuthenticated ? returnTo : "/");
		});
	}
}
