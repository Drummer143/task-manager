import React, { useCallback, useEffect, useState } from "react";

import { MessageOutlined } from "@ant-design/icons";
import Chat from "@task-manager/chat";
import { type ChatProps } from "@task-manager/chat";
import { useDisclosure } from "@task-manager/react-utils";
import { Button } from "antd";
import { createStyles } from "antd-style";
import { Channel } from "phoenix";
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

const TaskChat: React.FC = () => {
	const [channel, setChannel] = useState<Channel | null>(null);

	const userId = useAuthStore.getState().user.id;

	const taskId = useSearchParams()[0].get("taskId")!;

	const { open, onOpen, onClose } = useDisclosure();

	const { drawerBody, drawer } = useStyles().styles;

	const socket = useChatSocketStore().getSocket();

	const getAllMessages: ChatProps["getAllMessages"] = useCallback(
		cb => {
			if (channel?.state !== "joined") {
				return channel?.on("join", () => {
					channel?.push("get_all", {}).receive("ok", cb);
				});
			}

			return channel?.push("get_all", {}).receive("ok", cb);
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
			const ref = channel?.on("new", (message) => {
				console.debug("new", { message });
				cb(message);
			});

			return () => {
				channel?.off("new", ref);
			};
		},
		[channel]
	);

	useEffect(() => {
		if (!taskId) {
			return;
		}

		const chatChannel = socket.channel(`chat:${taskId}`, { user_id: userId });

		chatChannel.join().receive("ok", () => console.debug("Joined"));

		setChannel(chatChannel);

		return () => {
			chatChannel.leave();
		};
	}, [socket, taskId, userId]);

	return (
		<>
			<Button type="text" icon={<MessageOutlined />} onClick={onOpen} />

			<Drawer
				open={open}
				onClose={onClose}
				title="Discussion"
				classNames={{ body: drawerBody, wrapper: drawer }}
			>
				<Chat
					currentUserId={userId}
					subscribe={subscribe}
					sendMessage={sendMessage}
					getAllMessages={getAllMessages}
				/>
			</Drawer>
		</>
	);
};

export default TaskChat;

