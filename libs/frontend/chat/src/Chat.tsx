import React from "react";

import { SendOutlined } from "@ant-design/icons";
import { Button, Divider, Input, List, Typography } from "antd";

import { useStyles } from "./styles";
import Message from "./ui/Message";

export interface MessageData {
	id: string;
	text: string;
	createdAt: string;
	sender: {
		id: string;
		name: string;
		avatarUrl?: string;
	};
}

export interface ChatProps {
	currentUserId: string;

	messages?: MessageData[];

	onUserClick?: (userId: string) => void;
}

const Chat: React.FC<ChatProps> = ({ currentUserId, onUserClick, messages = [] }) => {
	const styles = useStyles().styles;

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				overflow: "hidden",
				display: "flex",
				flexDirection: "column"
			}}
		>
			<List
				style={{ flex: 1 }}
				dataSource={messages}
				renderItem={(message, i) => {
					const prevMessageSameSender = messages[i - 1]?.sender.id !== message.sender.id;
					const nextMessageSameSender = messages[i + 1]?.sender.id !== message.sender.id;
					const prevDate = new Date(messages[i - 1]?.createdAt);
					const currentDate = new Date(message.createdAt);
					let prevMessageSameDay = false,
						prevMessageSameYear = false;

					if (i !== 0) {
						prevMessageSameDay =
							prevDate.getDate() === currentDate.getDate() &&
							prevDate.getMonth() === currentDate.getMonth() &&
							prevDate.getFullYear() === currentDate.getFullYear();
						prevMessageSameYear =
							currentDate.getFullYear() === currentDate.getFullYear();
					}

					return (
						<React.Fragment key={message.id}>
							{!prevMessageSameDay && (
								<Divider>
									<Typography.Text type="secondary">
										{new Date(message.createdAt).toLocaleDateString(undefined, {
											day: "2-digit",
											month: "short",
											year: prevMessageSameYear ? undefined : "numeric"
										})}
									</Typography.Text>
								</Divider>
							)}

							<Message
								createdAt={message.createdAt}
								text={message.text}
								marginBottom={nextMessageSameSender ? "large" : "small"}
								sentByCurrentUser={message.sender.id === currentUserId}
								senderName={prevMessageSameSender ? message.sender.name : undefined}
								avatarUrl={
									nextMessageSameSender ? message.sender.avatarUrl : undefined
								}
								onSenderClick={
									onUserClick ? () => onUserClick(message.sender.id) : undefined
								}
							/>
						</React.Fragment>
					);
				}}
			/>

			<div className={styles.textareaWrapper}>
				<Input.TextArea
					className={styles.textarea}
					placeholder="Type your message"
					autoSize={{ minRows: 2, maxRows: 5 }}
				/>

				<Button type="primary" icon={<SendOutlined />} className={styles.sendButton} />
			</div>
		</div>
	);
};

export default Chat;

