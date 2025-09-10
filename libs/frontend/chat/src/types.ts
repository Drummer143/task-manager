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
	getAllMessages: (cb: (messages: MessageData[]) => void) => void;

	onUserClick?: (userId: string) => void;
}

