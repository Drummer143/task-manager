export interface UserInfo {
	id: string;
	username: string;

	avatar?: string | null;
}

export interface MessageData {
	id: string;
	text: string;
	createdAt: string;
	sender: UserInfo;
}

export interface PresenceInfo {
	typingUsers?: UserInfo[];
}

export interface ChatProps {
	currentUserId: string;

	presence?: PresenceInfo;

	subscribe: (cb: (newMessage: MessageData) => void) => void;
	sendMessage: (text: string) => void;
	loadMessages: (cb: (messages: MessageData[]) => void, before?: string) => void;

	onUserClick?: (userId: string) => void;
	onTypingChange?: () => void;
}

export interface MessageListItemMessage {
	type: "message";
	message: MessageData;
	prevMessageSameSender: boolean;
	nextMessageSameSender: boolean;
}

export interface MessageListItemDivider {
	type: "divider";
	date: Date;
	renderYear: boolean;
}

export type MessageListItem = { id: string } & (MessageListItemMessage | MessageListItemDivider);

