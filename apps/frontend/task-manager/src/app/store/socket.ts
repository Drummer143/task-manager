import { TaskChatMessage } from "@task-manager/api";
import { create } from "zustand";

export type DefaultSocketStatus = "connecting" | "open" | "closing" | "closed";

export type ExtendedSocketStatus = DefaultSocketStatus | "uninitialized";

export type SocketEvent = keyof WebSocketEventMap;

type SubscriptionEntities = "chat";

export type SubscriptionId<T extends SubscriptionEntities = SubscriptionEntities> = `${T}:${string}`;

export type SocketOutgoingMessage =
	| {
			type: "sub";
			body: SubscriptionId;
	  }
	| {
			type: "unsub";
			body: SubscriptionId;
	  };

export type SocketIncomingMessage = {
	type: "sub";
	sub: SubscriptionId<"chat">;
	body: TaskChatMessage;
};

export type WebSocketEventListenerMap = {
	open: (event: WebSocketEventMap["open"]) => void;
	error: (event: WebSocketEventMap["error"]) => void;
	close: (event: WebSocketEventMap["close"]) => void;
	message: (message: SocketIncomingMessage, event: WebSocketEventMap["message"]) => void;
};

type ListenerMap = {
	[key in keyof WebSocketEventListenerMap]: Array<{
		listener: WebSocketEventListenerMap[key];
		once?: boolean;
	}>;
};

interface SocketState {
	socket?: WebSocket;

	status: ExtendedSocketStatus;

	init: (socketUrl?: string) => void;

	destroy: () => void;

	listen: <T extends SocketEvent>(status: T, cb: WebSocketEventListenerMap[T], once?: boolean) => void;

	unlisten: <T extends SocketEvent>(status: T, cb: WebSocketEventListenerMap[T]) => void;

	sendMessage: (message: SocketOutgoingMessage) => void;
}

const DEFAULT_SOCKET_URL = "ws://localhost:8080/socket";

export const useSocketStore = create<SocketState>((set, get) => {
	let listeners: ListenerMap = {
		close: [],
		error: [],
		message: [],
		open: []
	};

	const triggerListeners = <T extends SocketEvent>(status: T, ...args: Parameters<WebSocketEventListenerMap[T]>) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		listeners[status].forEach(({ listener }) => (listener as any)(...args));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		listeners[status] = listeners[status].filter(({ once }) => !once) as any;
	};

	let messageQueue: SocketOutgoingMessage[] = [];

	return {
		status: "uninitialized" as ExtendedSocketStatus,

		init: (socketUrl = DEFAULT_SOCKET_URL) => {
			if (get().socket) {
				return;
			}

			const socket = new WebSocket(socketUrl);

			set({ socket });

			socket.onopen = e => {
				set({ status: "open" });

				messageQueue.forEach(message => socket.send(JSON.stringify(message)));

				messageQueue = [];

				triggerListeners("open", e);
			};

			socket.onclose = e => {
				set({ status: "closed", socket: undefined });

				triggerListeners("close", e);
			};

			socket.onmessage = e => {
				triggerListeners("message", JSON.parse(e.data), e);
			};

			socket.onerror = e => {
				set({ status: "closed", socket: undefined });

				triggerListeners("error", e);
			};
		},

		destroy: () => {
			get().socket?.close();

			set({ socket: undefined, status: "closed" });

			setTimeout(() => {
				listeners = {
					close: [],
					error: [],
					message: [],
					open: []
				};
			}, 250);
		},

		listen: (status, cb, once = false) => {
			listeners[status].push({ listener: cb, once });
		},

		unlisten: (status, cb) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			listeners[status] = listeners[status].filter(({ listener }) => listener !== cb) as any;
		},

		sendMessage: message => {
			const { socket, status } = get();

			if (status !== "open") {
				messageQueue.push(message);
			} else {
				socket?.send(JSON.stringify(message));
			}
		}
	};
});
