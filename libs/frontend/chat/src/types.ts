import { Socket } from "phoenix";

export interface MessageData {
	id: string;
	text: string;
	createdAt: string;
	sender: {
		id: string;
		name: string;
		avatarUrl?: string;
	};
}

export interface ChatProps {
	socket: Socket;
	chatId: string;
	currentUserId: string;

	onUserClick?: (userId: string) => void;
}
