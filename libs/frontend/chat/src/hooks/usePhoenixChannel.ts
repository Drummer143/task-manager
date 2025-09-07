import { useCallback, useEffect, useRef, useState } from "react";

import { Channel, Socket } from "phoenix";

import { MessageData } from "../types";

export const usePhoenixChannel = (socket: Socket, chatId: string, userId: string) => {
	const channelRef = useRef<Channel | null>(null);

	const [messages, setMessages] = useState<MessageData[]>([]);

	const sendMessage = useCallback((body: string) => {
		channelRef.current?.push("new_msg", { body });
	}, []);

	useEffect(() => {
		const channel = socket.channel(`chat:${chatId}`, { user_id: userId });

		channelRef.current = channel;

		channel.join();

		channel.on("new_msg", ({ body, user_id: userId }: { body: string; user_id: string }) => {
			setMessages(prev => [
				...prev,
				{
					id: Date.now().toString(),
					text: body,
					createdAt: new Date().toISOString(),
					sender: { id: userId, name: "User", avatarUrl: "" }
				}
			]);
		});

		return () => {
			channelRef.current?.leave();
		};
	}, [socket, chatId, userId]);

	return {
		sendMessage,
		messages
	};
};

