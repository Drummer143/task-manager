import { MessageData, MessageListItem, MessageListItemMessage } from "../types";

export const transformSingleMessage = (
	message: MessageData,
	nextMessage?: MessageData
): MessageListItem[] => {
	const result: MessageListItem[] = [];

	const nextMessageSameSender = nextMessage?.sender.id === message.sender.id;
	const currentDate = new Date(message.createdAt);
	let nextMessageSameDay = false,
		nextMessageSameYear = false;

	if (nextMessage) {
		const nextDate = new Date(nextMessage.createdAt);

		nextMessageSameYear = nextDate.getFullYear() === currentDate.getFullYear();
		nextMessageSameDay =
			nextDate.getDate() === currentDate.getDate() &&
			nextDate.getMonth() === currentDate.getMonth() &&
			nextMessageSameYear;
	}

	const showUserInfo = !nextMessageSameSender || !nextMessageSameDay;

	result.push({
		id: message.id,
		type: "message",
		message,
		uiProps: {
			showUserInfo
		}
	});

	if (!nextMessageSameDay && nextMessage) {
		result.push({
			id: `divider-${message.id}`,
			type: "divider",
			props: {
				date: new Date(message.createdAt),
				renderYear: nextMessageSameYear
			}
		});
	}

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

	const showUserInfo = !nextMessageSameSender || !nextMessageSameDay;

	return {
		...message,
		uiProps: {
			showUserInfo
		}
	};
};

export const prepareMessagesBeforeRender = (messages: MessageData[]): MessageListItem[] => {
	const result: MessageListItem[] = [];

	messages.forEach((message, index) => {
		result.push(...transformSingleMessage(message, messages[index + 1]));
	});

	return result;
};

export const removeMessageById = (items: MessageListItem[], id: string): MessageListItem[] => {
	const idx = items.findIndex(item => item.id === id);

	if (idx === -1 || idx === items.length - 1) {
		return items;
	}

	let nextMessageIdx = idx - 1;
	let nextMessage: MessageData | undefined;

	while (nextMessageIdx >= 0) {
		const item = items[nextMessageIdx];

		if (item.type === "message") {
			nextMessage = item.message;
			break;
		}

		nextMessageIdx--;
	}

	if (!nextMessage) {
		return items;
	}

	let prevMessageIdx = idx + 1;
	let prevMessage: MessageData | undefined;

	while (prevMessageIdx < items.length) {
		const item = items[prevMessageIdx];

		if (item.type === "message") {
			prevMessage = item.message;
			break;
		}

		prevMessageIdx++;
	}

	const transformedNextMessage = transformSingleMessage(nextMessage, prevMessage);
	const result = [...items];

	result.splice(nextMessageIdx, prevMessageIdx - nextMessageIdx, ...transformedNextMessage);

	return result;
};

export const getPlaceholderAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${name}`;

