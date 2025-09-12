import { useCallback } from "react";

import { MessageListItem } from "../types";
import Divider from "../ui/Divider";
import Message from "../ui/Message";

export const useMessageRenderer = (
	messages: MessageListItem[],
	currentUserId: string,
	onUserClick?: (userId: string) => void
) => {
	return useCallback(
		(item: MessageListItem, index: number) => {
			switch (item.type) {
				case "divider":
					return <Divider date={item.date} renderYear={item.renderYear} />;
				case "message":
					return (
						<Message
							createdAt={item.message.createdAt}
							text={item.message.text}
							last={index === messages.length - 1}
							paddingBottom={item.nextMessageSameSender ? "large" : "small"}
							sentByCurrentUser={item.message.sender.id === currentUserId}
							senderName={item.message.sender.username}
							showSenderName={item.prevMessageSameSender}
							showAvatar={item.nextMessageSameSender}
							avatarUrl={item.message.sender.avatar}
							onSenderClick={
								onUserClick ? () => onUserClick(item.message.sender.id) : undefined
							}
						/>
					);
				default:
					throw new Error(
						`Unknown list item: ${(item as { type: string } | null)?.type}`
					);
			}
		},
		[messages, currentUserId, onUserClick]
	);
};

