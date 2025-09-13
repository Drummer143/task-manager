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
					return <Divider key={item.id} {...item.props} />;
				case "message":
					return (
						<Message
							key={item.id}
							createdAt={item.message.createdAt}
							text={item.message.text}
							last={index === messages.length - 1}
							paddingBottom={item.uiProps.paddingBottom}
							sentByCurrentUser={item.message.sender.id === currentUserId}
							senderName={item.message.sender.username}
							showSenderName={item.uiProps.showSenderName}
							showAvatar={item.uiProps.showAvatar}
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

