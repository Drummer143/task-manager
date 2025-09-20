import { useCallback } from "react";

import { MessageListItem } from "../types";
import Divider from "../ui/Divider";
import Message from "../ui/Message";

export const useMessageRenderer = (
	currentUserId: string,
	onUserClick?: (userId: string) => void,
	contextMenuOnItem?: number
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
							id={item.id}
							createdAt={item.message.createdAt}
							text={item.message.text}
							sentByCurrentUser={item.message.sender.id === currentUserId}
							senderName={item.message.sender.username}
							showUserInfo={item.uiProps.showUserInfo}
							avatarUrl={item.message.sender.avatar}
							onSenderClick={onUserClick}
							index={index}
							contextMenuOpened={contextMenuOnItem === index}
						/>
					);
				default:
					throw new Error(
						`Unknown list item: ${(item as { type: string } | null)?.type}`
					);
			}
		},
		[currentUserId, onUserClick, contextMenuOnItem]
	);
};

