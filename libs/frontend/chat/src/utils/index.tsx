import { MessageData, MessageListItem, MessageListItemMessage } from "../types";

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
		id: `message-${message.id}`,
		type: "message",
		message,
		uiProps: {
			showUserInfo
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
		result.push(...transformSingleMessage(message, messages[index - 1]));
	});

	return result;
};

export const getPlaceholderAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${name}`;

