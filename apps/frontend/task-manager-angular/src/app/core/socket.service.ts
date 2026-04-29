import { inject, Injectable, OnDestroy } from "@angular/core";
import { OidcSecurityService } from "angular-auth-oidc-client";
import { Channel, Socket } from "phoenix";
import { take } from "rxjs";

@Injectable({ providedIn: "root" })
export class SocketService implements OnDestroy {
	private readonly oidc = inject(OidcSecurityService);

	private socket?: Socket;
	private channels = new Map<string, Channel>();

	connect(token: string): Socket {
		const state = this.socket?.connectionState();

		if (this.socket && (state === "open" || state === "connecting")) {
			return this.socket;
		}

		this.socket?.disconnect();

		const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const socketUrl = `${wsProtocol}//${window.location.host}/socket`;

		this.socket = new Socket(socketUrl, {
			params: { token },
			reconnectAfterMs: () => 1500
		});

		this.socket.connect();

		return this.socket;
	}

	connectWithCurrentToken(): void {
		this.oidc.getAccessToken().pipe(take(1)).subscribe((token: string) => {
			if (token) {
				this.connect(token);
			}
		});
	}

	channel(topic: string, params?: Record<string, unknown>): Channel {
		if (!this.socket) {
			throw new Error("Socket is not initialized. Call connect() first.");
		}

		const existing = this.channels.get(topic);

		if (existing) {
			return existing;
		}

		const ch = this.socket.channel(topic, params);

		ch.join();
		this.channels.set(topic, ch);

		return ch;
	}

	leaveChannel(topic: string): void {
		const ch = this.channels.get(topic);

		if (ch) {
			ch.leave();
			this.channels.delete(topic);
		}
	}

	disconnect(): void {
		this.channels.forEach(ch => ch.leave());
		this.channels.clear();
		this.socket?.disconnect();
		this.socket = undefined;
	}

	getSocket(): Socket | undefined {
		return this.socket;
	}

	ngOnDestroy(): void {
		this.disconnect();
	}
}
