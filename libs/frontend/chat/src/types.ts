export interface MessageData {
	id: string;
	text: string;
	createdAt: string;
	sender: {
		id: string;
		username: string;

		avatar?: string;
	};
}

export interface ChatProps {
	currentUserId: string;

	subscribe: (cb: (newMessage: MessageData) => void) => void;
	sendMessage: (text: string) => void;
	loadMessages: (cb: (messages: MessageData[]) => void, before?: string) => void;

	onUserClick?: (userId: string) => void;
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

