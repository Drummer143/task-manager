import { MessageData, MessageListItem } from "../types";

export const transformSingleMessage = (
	message: MessageData,
	prevMessage?: MessageData,
	nextMessage?: MessageData
): MessageListItem[] => {
	const result: MessageListItem[] = [];

	const prevMessageSameSender = prevMessage?.sender.id !== message.sender.id;
	const nextMessageSameSender = nextMessage?.sender.id !== message.sender.id;
	const currentDate = new Date(message.createdAt);
	let prevMessageSameDay = false,
		prevMessageSameYear = false;

	if (prevMessage) {
		const prevDate = new Date(prevMessage?.createdAt);

		prevMessageSameDay =
			prevDate.getDate() === currentDate.getDate() &&
			prevDate.getMonth() === currentDate.getMonth() &&
			prevDate.getFullYear() === currentDate.getFullYear();
		prevMessageSameYear = currentDate.getFullYear() === currentDate.getFullYear();
	}

	if (!prevMessageSameDay && prevMessage) {
		result.push({
			type: "divider",
			date: new Date(message.createdAt),
			renderYear: prevMessageSameYear,
			id: `divider-${message.id}`
		});
	}

	result.push({
		type: "message",
		message,
		prevMessageSameSender,
		nextMessageSameSender,
		id: `message-${message.id}`
	});

	return result;
};

export const prepareMessagesBeforeRender = (messages: MessageData[]): MessageListItem[] => {
	const result: MessageListItem[] = [];

	messages.forEach((message, index) => {
		result.push(...transformSingleMessage(message, messages[index - 1], messages[index + 1]));
	});

	return result;
};

export const getPlaceholderAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${name}`;
