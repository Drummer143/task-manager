import React from "react";

import { List } from "antd";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { usePhoenixChannel } from "./hooks/usePhoenixChannel";
import { useStyles } from "./styles";
import { ChatProps } from "./types";
import NewMessageInput from "./ui/NewMessageInput";

const Chat: React.FC<ChatProps> = ({
	currentUserId,
	onUserClick,
	socket,
	chatId
}) => {
	const { sendMessage, messages } = usePhoenixChannel(socket, chatId, currentUserId);

	const renderMessage = useMessageRenderer(messages, currentUserId, onUserClick);

	const styles = useStyles().styles;

	return (
		<div className={styles.wrapper}>
			<List className={styles.messageList} dataSource={messages} renderItem={renderMessage} />

			<NewMessageInput onSend={sendMessage} />
		</div>
	);
};

export default Chat;

