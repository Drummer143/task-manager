import React, { useCallback } from "react";

import { Divider, Typography } from "antd";

import { MessageData } from "../types";
import Message from "../ui/Message";

export const useMessageRenderer = (
	messages: MessageData[],
	currentUserId: string,
	onUserClick?: (userId: string) => void
) => {
	return useCallback(
		(message: MessageData, i: number) => {
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
				prevMessageSameYear = currentDate.getFullYear() === currentDate.getFullYear();
			}

			return (
				<React.Fragment key={message.id}>
					{!prevMessageSameDay && i !== 0 && (
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
						avatarUrl={nextMessageSameSender ? message.sender.avatar : undefined}
						onSenderClick={
							onUserClick ? () => onUserClick(message.sender.id) : undefined
						}
					/>
				</React.Fragment>
			);
		},
		[messages, currentUserId, onUserClick]
	);
};

