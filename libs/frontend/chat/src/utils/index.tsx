import { MessageData, MessageListItem, MessageListItemMessage } from "../types";

export const transformSingleMessage = (
	message: MessageData,
	prevMessage?: MessageData,
	nextMessage?: MessageData
): MessageListItem[] => {
	const result: MessageListItem[] = [];

	const prevMessageSameSender = prevMessage?.sender.id === message.sender.id;
	const nextMessageSameSender = nextMessage?.sender.id === message.sender.id;
	const currentDate = new Date(message.createdAt);
	let prevMessageSameDay = false,
		prevMessageSameYear = false,
		nextMessageSameDay = false;

	if (prevMessage) {
		const prevDate = new Date(prevMessage.createdAt);

		prevMessageSameYear = prevDate.getFullYear() === currentDate.getFullYear();
		prevMessageSameDay =
			prevDate.getDate() === currentDate.getDate() &&
			prevDate.getMonth() === currentDate.getMonth() &&
			prevMessageSameYear;
	}

	if (nextMessage) {
		const nextDate = new Date(nextMessage.createdAt);

		nextMessageSameDay =
			nextDate.getDate() === currentDate.getDate() &&
			nextDate.getMonth() === currentDate.getMonth() &&
			nextDate.getFullYear() === currentDate.getFullYear();
	}

	if (!prevMessageSameDay && prevMessage) {
		result.push({
			id: `divider-${message.id}`,
			type: "divider",
			props: {
				date: new Date(message.createdAt),
				renderYear: prevMessageSameYear
			}
		});
	}

	result.push({
		id: `message-${message.id}`,
		type: "message",
		message,
		uiProps: {
			paddingBottom: nextMessageSameSender ? "small" : "large",
			showSenderName: !prevMessageSameSender || !prevMessageSameDay,
			showAvatar: !nextMessageSameSender || (nextMessage && !nextMessageSameDay)
		}
	});

	return result;
};

export const updateMessageByNextMessage = (
	message: MessageListItemMessage,
	nextMessage: MessageData
): MessageListItem => {
	const nextDate = new Date(nextMessage.createdAt);
	const currentDate = new Date(message.message.createdAt);

	const nextMessageSameSender = nextMessage.sender.id === message.message.sender.id;
	const nextMessageSameDay =
		nextDate.getDate() === currentDate.getDate() &&
		nextDate.getMonth() === currentDate.getMonth() &&
		nextDate.getFullYear() === currentDate.getFullYear();

	return {
		...message,
		uiProps: {
			paddingBottom: nextMessageSameSender ? "small" : "large",
			showSenderName: !nextMessageSameSender || !nextMessageSameDay,
			showAvatar: !nextMessageSameSender || (nextMessage && !nextMessageSameDay)
		}
	};
};

export const prepareMessagesBeforeRender = (messages: MessageData[]): MessageListItem[] => {
	const result: MessageListItem[] = [];

	messages.forEach((message, index) => {
		result.push(...transformSingleMessage(message, messages[index - 1], messages[index + 1]));
	});

	return result;
};

export const getPlaceholderAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${name}`;

