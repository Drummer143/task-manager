export interface MessageData {
	id: string;
	text: string;
	createdAt: string;
	sender: {
		id: string;
		name: string;
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

