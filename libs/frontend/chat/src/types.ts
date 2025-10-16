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

	pinnedBy?: UserInfo | null;
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
	loadMessages: (
		cb: (messages: MessageData[]) => void,
		query: { before?: string; after?: string; limit?: number }
	) => void;

	subscribeToNewMessages: (cb: (newMessage: MessageData) => void) => () => void;
	subscribeToUpdatedMessages: (
		cb: (payload: { action: "edit" | "pin" | "unpin"; message: MessageData }) => void
	) => () => void;
	subscribeToDeletedMessages: (cb: (params: { id: string }) => void) => () => void;

	onUserClick?: (userId: string) => void;

	deleteMessage?: (id: string) => void;
	onTypingChange?: () => void;
	updateMessage?: (id: string, text: string) => void;
	pinMessage?: (id: string) => void;
	loadPins?: (cb: (pins: MessageData[]) => void) => void;
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
	type: "placeholder";
}

export type MessageListItem = MessageListItemMessage | MessageListItemDivider;

export type ListItemType = MessageListItem["type"];

