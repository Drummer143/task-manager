import React, { useCallback, useEffect, useState } from "react";

import Chat, { PresenceInfo, UserInfo } from "@task-manager/chat";
import { type ChatProps } from "@task-manager/chat";
import { Channel, Presence } from "phoenix";

import { useAuthStore } from "../../app/store/auth";
import { useChatSocketStore } from "../../app/store/socket";
import { userManager } from "../../app/userManager";

interface RawPresenceInfo {
	[key: string]: {
		metas: Array<{
			user_id: string;
			typing: boolean;
			id: string;
			avatar: string | null;
			username: string;
			joined_at: number;
		}>;
	};
}

const TaskChat: React.FC<{ taskId?: string }> = ({ taskId }) => {
	const [presence, setPresence] = useState<PresenceInfo | undefined>(undefined);
	const [channel, setConnection] = useState<Channel | undefined>(undefined);
	const [isJoined, setIsJoined] = useState(false);

	const userId = useAuthStore.getState().user.id;

	const loadMessages = useCallback<ChatProps["loadMessages"]>(
		(cb, query) => {
			channel?.push("get_all", query).receive("ok", cb);
		},
		[channel]
	);

	const loadMessagesAround = useCallback<ChatProps["loadMessagesAround"]>(
		(cb, messageId, limit) => {
			channel?.push("get_around", { messageId, limit }).receive("ok", cb);
		},
		[channel]
	);

	const sendMessage: ChatProps["sendMessage"] = useCallback(
		payload => {
			return channel?.push("create", payload);
		},
		[channel]
	);

	const subscribeToNewMessages: ChatProps["subscribeToNewMessages"] = useCallback(
		cb => {
			const refNewMessage = channel?.on("new", cb);

			return () => {
				channel?.off("new", refNewMessage);
			};
		},
		[channel]
	);

	const subscribeToDeletedMessages: ChatProps["subscribeToDeletedMessages"] = useCallback(
		cb => {
			const refDeleteMessage = channel?.on("delete", cb);

			return () => {
				channel?.off("delete", refDeleteMessage);
			};
		},
		[channel]
	);

	const subscribeToUpdatedMessages: ChatProps["subscribeToUpdatedMessages"] = useCallback(
		cb => {
			const refUpdateMessage = channel?.on("update", cb);

			return () => {
				channel?.off("update", refUpdateMessage);
			};
		},
		[channel]
	);

	const handleTypingChange = useCallback(() => {
		channel?.push("typing", {});
	}, [channel]);

	const handleDeleteMessage: NonNullable<ChatProps["deleteMessage"]> = useCallback(
		id => channel?.push("delete", { id }),
		[channel]
	);

	const handleUpdateMessage: NonNullable<ChatProps["updateMessage"]> = useCallback(
		(id, text) => channel?.push("update", { id, text }),
		[channel]
	);

	const handlePinMessage: NonNullable<ChatProps["pinMessage"]> = useCallback(
		id => channel?.push("pin", { id }),
		[channel]
	);

	const handleGetPinnedMessages = useCallback<NonNullable<ChatProps["loadPins"]>>(
		cb => {
			channel?.push("get_pinned", {}).receive("ok", cb);
		},
		[channel]
	);

	useEffect(() => {
		if (!taskId) {
			return;
		}

		let channel: Channel | undefined;

		userManager.getUser().then(user => {
			if (!user) {
				return;
			}

			const socket = useChatSocketStore.getState().getSocket(user.access_token);

			channel = socket.channel(`chat:${taskId}`, { user_id: user.profile.sub });
			let presences: RawPresenceInfo = {};

			const handleRawPresenceInfo = (info: RawPresenceInfo) => {
				const typingUsers = Object.entries(info).reduce((acc, [key, value]) => {
					if (key === user.profile.sub) {
						return acc;
					}

					const typingIndex = value.metas.findIndex(meta => meta.typing);

					if (typingIndex !== -1) {
						acc.push({
							id: key,
							username: value.metas[typingIndex].username,
							avatar: value.metas[typingIndex].avatar
						});
					}

					return acc;
				}, [] as UserInfo[]);

				setPresence({ typingUsers });
			};

			channel.on("presence_diff", diff => {
				presences = Presence.syncDiff(presences, diff);
				handleRawPresenceInfo(presences);
			});

			const presenceStateRef = channel.on("presence_state", state => {
				presences = Presence.syncState(presences, state);
				channel?.off("presence_state", presenceStateRef);
				handleRawPresenceInfo(presences);
			});

			channel.join().receive("ok", () => {
				setIsJoined(true);
			});

			setConnection(channel);
		});

		return () => {
			setConnection(undefined);
			setIsJoined(false);
			channel?.leave();
		};
	}, [taskId]);

	if (!channel || !isJoined) {
		return null;
	}

	return (
		<Chat
			presence={presence}
			onTypingChange={handleTypingChange}
			currentUserId={userId}
			subscribeToNewMessages={subscribeToNewMessages}
			subscribeToDeletedMessages={subscribeToDeletedMessages}
			subscribeToUpdatedMessages={subscribeToUpdatedMessages}
			sendMessage={sendMessage}
			loadMessages={loadMessages}
			loadMessagesAround={loadMessagesAround}
			deleteMessage={handleDeleteMessage}
			updateMessage={handleUpdateMessage}
			pinMessage={handlePinMessage}
			loadPins={handleGetPinnedMessages}
		/>
	);
};

export default TaskChat;

