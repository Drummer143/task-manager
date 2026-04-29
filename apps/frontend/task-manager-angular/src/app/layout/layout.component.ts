import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { SocketService } from "../core/socket.service";

@Component({
	selector: "app-layout",
	standalone: true,
	imports: [RouterOutlet],
	template: `
		<div class="app-layout">
			<header class="app-header">
				<span>Task Manager</span>
			</header>
			<div class="app-body">
				<aside class="app-sidebar">
					<!-- sidebar nav will go here -->
				</aside>
				<main class="app-content">
					<router-outlet />
				</main>
			</div>
		</div>
	`,
	styles: `
		.app-layout {
			display: flex;
			flex-direction: column;
			height: 100vh;
		}
		.app-header {
			display: flex;
			align-items: center;
			padding: 0 1rem;
			height: 48px;
			background: var(--p-surface-800);
			color: var(--p-surface-0);
		}
		.app-body {
			display: flex;
			flex: 1;
			overflow: hidden;
		}
		.app-sidebar {
			width: 256px;
			background: var(--p-surface-50);
			border-right: 1px solid var(--p-surface-200);
			overflow-y: auto;
		}
		.app-content {
			flex: 1;
			overflow-y: auto;
			padding: 1rem;
		}
	`
})
export class LayoutComponent implements OnInit, OnDestroy {
	private readonly socketService = inject(SocketService);

	ngOnInit(): void {
		this.socketService.connectWithCurrentToken();
	}

	ngOnDestroy(): void {
		this.socketService.disconnect();
	}
}
