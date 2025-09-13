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
	createdAt: string;
	sender: UserInfo;
}

export interface PresenceInfo {
	typingUsers?: UserInfo[];
}

export interface ChatProps {
	currentUserId: string;

	presence?: PresenceInfo;
	className?: string;

	subscribe: (cb: (newMessage: MessageData) => void) => void;
	sendMessage: (text: string) => void;
	loadMessages: (cb: (messages: MessageData[]) => void, before?: string) => void;

	onUserClick?: (userId: string) => void;
	onTypingChange?: () => void;
}

interface DefaultListItemParams {
	id: string;
}

export interface MessageListItemMessage extends DefaultListItemParams {
	type: "message";
	message: MessageData;
	uiProps: Pick<MessageProps, "paddingBottom" | "showSenderName" | "showAvatar">;
}

export interface MessageListItemDivider extends DefaultListItemParams {
	type: "divider";
	props: DividerProps;
}

export type MessageListItem = MessageListItemMessage | MessageListItemDivider;

