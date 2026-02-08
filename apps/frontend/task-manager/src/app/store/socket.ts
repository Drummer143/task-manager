import { Channel, Socket } from "phoenix";
import { create } from "zustand";

type ChannelName = `chat:${string}`;

export interface SocketStoreState {
	channels: Partial<Record<ChannelName, Channel>>;

	socket?: Socket;

	getSocket: (token: string) => Socket;

	getChannel: (name: ChannelName) => Channel;

	closeSocket: () => void;
}

export const useSocketStore = create<SocketStoreState>((set, get) => ({
	channels: {},

	getSocket: token => {
		let socket = get().socket;
		const state = socket?.connectionState();

		if (socket && (state === "open" || state === "connecting")) {
			return socket;
		}

		socket?.disconnect();

		socket = new Socket(import.meta.env.VITE_SOCKET_URL, {
			params: { token },
			reconnectAfterMs: () => 1500
		});

		socket.connect();

		set({ socket });

		return socket;
	},

	getChannel: name => {
		const store = get();

		if (!store.socket) {
			throw new Error("Socket is not initialized");
		}

		let channel = store.channels[name];

		if (channel) {
			return channel;
		}

		channel = store.socket.channel(name);

		channel.join();

		set({
			channels: {
				...store.channels,
				[name]: channel
			}
		});

		return channel;
	},

	closeSocket: () => get().socket?.disconnect()
}));

