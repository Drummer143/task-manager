import { useCallback } from "react";

import { chatStore } from "../state";
import { MessageListItem } from "../types";
import Message from "../ui/Message";

export const useMessageRenderer = (
	currentUserId: string,
	onUserClick?: (userId: string) => void
) => {
	return useCallback(
		(index: number, _: unknown, __: MessageListItem) => {
			const idx = index - chatStore.firstItemIndex;
			const item = chatStore.listInfo.items[idx];

			if (!item) {
				return null;
			}

			switch (item.type) {
				case "message":
					return (
						<Message
							key={item.id}
							id={item.id}
							pinnedBy={item.message.pinnedBy}
							createdAt={item.message.createdAt}
							text={item.message.text}
							sentByCurrentUser={item.message.sender.id === currentUserId}
							senderName={item.message.sender.username}
							showUserInfo={item.uiProps.showUserInfo}
							avatarUrl={item.message.sender.avatar}
							onSenderClick={onUserClick}
							index={index}
							replyTo={item.message.replyTarget}
							updatedAt={item.message.updatedAt}
						/>
					);
				default:
					throw new Error(
						`Unknown list item: ${(item as { type: string } | null)?.type}`
					);
			}
		},
		[currentUserId, onUserClick]
	);
};

