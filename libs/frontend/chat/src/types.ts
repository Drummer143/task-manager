import { MessageProps } from "./ui/Message";
import type { MessageToHost } from "@task-manager/file-transfer-worker"

export interface DraftImage {
	id: string;
	draftId: string;
	file: File;
	fileName: string;
	mimeType: string;
	createdAt: number;
}

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
	replyTarget?: Pick<MessageData, "id" | "text" | "sender"> | null;
}

export interface PresenceInfo {
	typingUsers?: UserInfo[];
}

export interface AttachmentHandlers {
	uploadFile: (file: File) => Promise<DraftImage>;
	cancelUpload: (fileId: string) => void;
	subscribeToUploadEvents: (cb: (event: MessageToHost) => void) => () => void;
}

export interface ChatProps {
	currentUserId: string;

	presence?: PresenceInfo;
	className?: string;

	sendMessage: (payload: { text: string; replyTo?: string }) => void;
	loadMessages: (
		cb: (response: {
			messages: MessageData[];
			total?: number;
			hasMoreOnTop: boolean;
			hasMoreOnBottom: boolean;
		}) => void,
		query: { before?: string; after?: string; limit?: number; countTotal?: boolean }
	) => void;
	loadMessagesAround: (
		cb: (response: {
			messages: MessageData[];
			targetPosition: number;
			firstMessagePosition: number;
			hasMoreOnTop: boolean;
			hasMoreOnBottom: boolean;
		}) => void,
		messageId: string,
		limit?: number
	) => void;

	attachmentHandlers?: AttachmentHandlers;

	buildAvatarUrl: (avatar: string) => string;

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

export type MessageListItem = MessageListItemMessage;

export type ListItemType = MessageListItem["type"];

