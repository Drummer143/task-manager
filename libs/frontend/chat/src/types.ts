import { DividerProps } from "./ui/Divider";
import { MessageProps } from "./ui/Message";

export interface UserInfo {
	id: string;
	username: string;

	avatar?: string | null;
}

export interface MessageData {
	id: string;
	text: string;
	sender: UserInfo;
	createdAt: string;

	updatedAt?: string | null;
}

export interface PresenceInfo {
	typingUsers?: UserInfo[];
}

export interface ChatProps {
	currentUserId: string;

	presence?: PresenceInfo;
	className?: string;

	sendMessage: (text: string) => void;
	loadMessages: (cb: (messages: MessageData[]) => void, before?: string) => void;

	subscribeToNewMessages: (cb: (newMessage: MessageData) => void) => () => void;
	subscribeToUpdatedMessages: (cb: (updatedMessage: Omit<MessageData, "sender">) => void) => () => void;
	subscribeToDeletedMessages: (cb: (params: { id: string }) => void) => () => void;

	onUserClick?: (userId: string) => void;
	deleteMessage?: (id: string) => void;
	onTypingChange?: () => void;
	updateMessage?: (id: string, text: string) => void;
}

interface DefaultListItemParams {
	id: string;
}

export interface MessageListItemMessage extends DefaultListItemParams {
	type: "message";
	message: MessageData;
	uiProps: Pick<MessageProps, "showUserInfo">;
}

export interface MessageListItemDivider extends DefaultListItemParams {
	type: "divider";
	props: DividerProps;
}

export type MessageListItem = MessageListItemMessage | MessageListItemDivider;

export type ListItemType = MessageListItem["type"];

