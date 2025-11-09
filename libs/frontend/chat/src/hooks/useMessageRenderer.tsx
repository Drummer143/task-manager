import { useCallback } from "react";

import { useSnapshot } from "valtio";

import { chatStore } from "../state";
import { MessageListItem } from "../types";
import Message from "../ui/Message";

export const useMessageRenderer = (
	currentUserId: string,
	onUserClick?: (userId: string) => void
) => {
	const chatStoreSnapshot = useSnapshot(chatStore);

	return useCallback(
		(index: number, _: unknown, __: MessageListItem) => {
			const idx = index - chatStoreSnapshot.firstItemIndex;
			const item = chatStoreSnapshot.listInfo.items[idx];

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
							replyTo={item.message.replyTarget}
							updatedAt={item.message.updatedAt}
							highlighted={chatStoreSnapshot.highlightedItemId === item.id}
							editing={chatStoreSnapshot.edit?.messageId === item.id}
						/>
					);
				default:
					throw new Error(
						`Unknown list item: ${(item as { type: string } | null)?.type}`
					);
			}
		},
		[
			chatStoreSnapshot.edit?.messageId,
			chatStoreSnapshot.firstItemIndex,
			chatStoreSnapshot.highlightedItemId,
			chatStoreSnapshot.listInfo.items,
			currentUserId,
			onUserClick
		]
	);
};

