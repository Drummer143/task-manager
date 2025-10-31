import { MessageData, MessageListItem } from "../types";

export const transformSingleMessage = (
	message: MessageData,
	prevMessage?: MessageData
): MessageListItem[] => {
	const result: MessageListItem[] = [];

	const prevMessageSameSender = prevMessage?.sender.id === message.sender.id;
	const currentDate = new Date(message.createdAt);
	let prevMessageSameDay = false,
		prevMessageSameYear = false;

	if (prevMessage) {
		const prevDate = new Date(prevMessage.createdAt);

		prevMessageSameYear = prevDate.getFullYear() === currentDate.getFullYear();
		prevMessageSameDay =
			prevDate.getDate() === currentDate.getDate() &&
			prevDate.getMonth() === currentDate.getMonth() &&
			prevMessageSameYear;
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

	const showUserInfo = !prevMessageSameSender || !prevMessageSameDay;

	result.push({
		id: message.id,
		type: "message",
		message,
		uiProps: {
			showUserInfo
		}
	});

	return result;
};

export const prepareMessagesBeforeRender = (messages: MessageData[]): MessageListItem[] => {
	const result: MessageListItem[] = [];

	messages.forEach((message, index) => {
		result.push(...transformSingleMessage(message, messages[index - 1]));
	});

	return result;
};

export const removeMessageById = (items: MessageListItem[], id: string): MessageListItem[] => {
	if (items.at(-1)?.id === id) {
		const isPenultimateDivider = items.at(-2)?.type === "divider";

		return items.slice(0, isPenultimateDivider ? -2 : -1);
	}

	const idx = items.findIndex(item => item.id === id);

	if (idx === -1) {
		return items;
	}

	let nextMessageIdx = idx + 1;
	let nextMessage: MessageData | undefined;

	while (nextMessageIdx < items.length) {
		const item = items[nextMessageIdx];

		if (item.type === "message") {
			nextMessage = item.message;
			break;
		}

		nextMessageIdx++;
	}

	if (!nextMessage) {
		return items;
	}

	let prevMessageIdx = idx - 1;
	let prevMessage: MessageData | undefined;

	while (prevMessageIdx >= 0) {
		const item = items[prevMessageIdx];

		if (item.type === "message") {
			prevMessage = item.message;
			break;
		}

		prevMessageIdx--;
	}

	const transformedNextMessage = transformSingleMessage(nextMessage, prevMessage);
	const result = [...items];

	result.splice(prevMessageIdx + 1, nextMessageIdx - prevMessageIdx, ...transformedNextMessage);

	return result;
};

export const getPlaceholderAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${name}`;

