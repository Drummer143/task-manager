import React, { useCallback, useEffect, useMemo, useState } from "react";

import { MessageOutlined } from "@ant-design/icons";
import Chat, { MessageData, PresenceInfo, UserInfo } from "@task-manager/chat";
import { type ChatProps } from "@task-manager/chat";
import { useDisclosure } from "@task-manager/react-utils";
import { Button } from "antd";
import { DrawerClassNames } from "antd/es/drawer/DrawerPanel";
import { createStyles } from "antd-style";
import { Channel, Presence } from "phoenix";
import { useSearchParams } from "react-router";

import { useAuthStore } from "../../../../../app/store/auth";
import { useChatSocketStore } from "../../../../../app/store/socket";
import Drawer from "../../../../../widgets/Drawer";

const useStyles = createStyles(({ css }) => ({
	drawer: css`
		height: 100%;

		& > * {
			max-height: 100%;
		}
	`,
	drawerBody: css`
		height: 100%;

		display: flex;
		flex-direction: column;

		padding: 0 !important;
	`
}));

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

const TaskChat: React.FC = () => {
	const [presence, setPresence] = useState<PresenceInfo | undefined>(undefined);
	const [channel, setConnection] = useState<Channel | undefined>(undefined);

	const userId = useAuthStore.getState().user.id;

	const taskId = useSearchParams()[0].get("taskId");

	const { open, onOpen, onClose } = useDisclosure();

	const styles = useStyles().styles;

	const socket = useChatSocketStore().getSocket();

	const drawerClassnames = useMemo<DrawerClassNames>(
		() => ({
			body: styles.drawerBody,
			wrapper: styles.drawer
		}),
		[styles]
	);

	const loadMessages = useCallback(
		(cb: (messages: MessageData[]) => void, before?: string) => {
			const requestMessages = () => {
				channel?.push("get_all", { before, limit: 15 }).receive("ok", cb);
			};

			if (channel?.state === "joined") {
				return requestMessages();
			}

			const joinRef = channel?.on("join", () => {
				channel?.off("join", joinRef);
				requestMessages();
			});
		},
		[channel]
	);

	const sendMessage: ChatProps["sendMessage"] = useCallback(
		text => {
			return channel?.push("create", { text });
		},
		[channel]
	);

	const subscribe: ChatProps["subscribe"] = useCallback(
		cb => {
			const ref = channel?.on("new", cb);

			return () => {
				channel?.off("new", ref);
			};
		},
		[channel]
	);

	const handleTypingChange = useCallback(() => {
		channel?.push("typing", {});
	}, [channel]);

	useEffect(() => {
		if (!taskId) {
			return;
		}

		const channel = socket.channel(`chat:${taskId}`, { user_id: userId });
		let presences: RawPresenceInfo = {};

		const handleRawPresenceInfo = (info: RawPresenceInfo) => {
			const typingUsers = Object.entries(info).reduce((acc, [key, value]) => {
				if (key === userId) {
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
			channel.off("presence_state", presenceStateRef);
			handleRawPresenceInfo(presences);
		});

		channel.join();

		setConnection(channel);

		return () => {
			setConnection(undefined);
			channel?.leave();
		};
	}, [socket, taskId, userId]);

	return (
		<>
			<Button type="text" icon={<MessageOutlined />} onClick={onOpen} />

			<Drawer open={open} onClose={onClose} title="Discussion" classNames={drawerClassnames}>
				<Chat
					presence={presence}
					onTypingChange={handleTypingChange}
					currentUserId={userId}
					subscribe={subscribe}
					sendMessage={sendMessage}
					loadMessages={loadMessages}
				/>
			</Drawer>
		</>
	);
};

export default TaskChat;

