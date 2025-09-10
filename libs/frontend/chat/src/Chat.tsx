import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button, List } from "antd";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { useStyles } from "./styles";
import { ChatProps, MessageData } from "./types";
import NewMessageInput from "./ui/NewMessageInput";

const Chat: React.FC<ChatProps> = ({
	currentUserId,
	onUserClick,
	getAllMessages,
	sendMessage,
	subscribe
}) => {
	const [messages, setMessages] = useState<MessageData[]>([]);
	const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

	const renderMessage = useMessageRenderer(messages, currentUserId, onUserClick);

	const styles = useStyles().styles;

	const listRef = useRef<HTMLDivElement | null>(null);

	const scrollToBottom = useCallback(() => {
		listRef.current?.scrollTo({
			top: listRef.current.scrollHeight
		});
	}, []);

	const handleSeeNewMessagesClick = useCallback(() => {
		setShowScrollBottomButton(false);
		scrollToBottom();
	}, [scrollToBottom]);

	useEffect(() => {
		getAllMessages(messages => {
			setMessages(messages);
		});

		return subscribe(message => {
			if (message.sender.id === currentUserId) {
				requestAnimationFrame(scrollToBottom);
			} else {
				setShowScrollBottomButton(true);
			}
			setMessages(messages => [...messages, message]);
		});
	}, [currentUserId, subscribe, getAllMessages, scrollToBottom]);

	return (
		<div className={styles.wrapper}>
			<List
				ref={listRef}
				className={styles.messageList}
				dataSource={messages}
				renderItem={renderMessage}
			/>

			<div className={styles.bottomContent}>
				{showScrollBottomButton && (
					<Button
						className={styles.seeNewMessagesButton}
						onClick={handleSeeNewMessagesClick}
					>
						See new messages
					</Button>
				)}

				<NewMessageInput onSend={sendMessage} />
			</div>
		</div>
	);
};

export default Chat;

