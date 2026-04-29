import { Route } from "@angular/router";

import { authGuard } from "./auth/auth.guard";
import { CallbackComponent } from "./auth/callback.component";
import { LayoutComponent } from "./layout/layout.component";

export const appRoutes: Route[] = [
	{
		path: "callback",
		component: CallbackComponent
	},
	{
		path: "",
		component: LayoutComponent,
		canActivate: [authGuard],
		children: [
			{
				path: "profile",
				loadComponent: () =>
					import("./pages/profile/profile.component").then(m => m.ProfileComponent)
			},
			{
				path: "pages/:id",
				loadComponent: () =>
					import("./pages/page/page.component").then(m => m.PageComponent)
			},
			{
				path: "workspace",
				loadComponent: () =>
					import("./pages/workspace/workspace.component").then(m => m.WorkspaceComponent)
			},
			{
				path: "tasks/:taskId",
				loadComponent: () =>
					import("./pages/task/task.component").then(m => m.TaskComponent)
			},
			{
				path: "",
				redirectTo: "profile",
				pathMatch: "full"
			},
			{
				path: "**",
				redirectTo: "profile"
			}
		]
	}
];
