import React from "react";

import { MessageOutlined } from "@ant-design/icons";
import Chat from "@task-manager/chat";
import { useDisclosure } from "@task-manager/react-utils";
import { Button } from "antd";
import { createStyles } from "antd-style";

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
	const userId = useAuthStore.getState().user.id;

	const { open, onOpen, onClose } = useDisclosure();

	const { drawerBody, drawer } = useStyles().styles;

	const chatSocket = useChatSocketStore().getSocket();

	return (
		<>
			<Button type="text" icon={<MessageOutlined />} onClick={onOpen} />

			<Drawer
				open={open}
				onClose={onClose}
				title="Discussion"
				classNames={{ body: drawerBody, wrapper: drawer }}
			>
				<Chat currentUserId={userId} socket={chatSocket} chatId="asd" />
			</Drawer>
		</>
	);
};

export default TaskChat;

