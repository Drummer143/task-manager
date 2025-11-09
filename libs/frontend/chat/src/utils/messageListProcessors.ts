import { chatStore } from "../state";
import { MessageData, MessageListItem, MessageListItemMessage } from "../types";

export interface ListInfo {
	items: MessageListItem[];
	groupCounts: number[];
	groupLabels: string[];
}

const isSameDate = (a: string, b: string) => {
	const aDate = new Date(a);
	const bDate = new Date(b);

	return (
		aDate.getDate() === bDate.getDate() &&
		aDate.getMonth() === bDate.getMonth() &&
		aDate.getFullYear() === bDate.getFullYear()
	);
};

export const pushMessage = (listInfo: ListInfo, message: MessageData): ListInfo => {
	const newListInfo = {
		items: [...listInfo.items],
		groupCounts: [...listInfo.groupCounts],
		groupLabels: [...listInfo.groupLabels]
	};

	const prevMessage = newListInfo.items[newListInfo.items.length - 1] as MessageListItemMessage;

	if (!isSameDate(prevMessage.message.createdAt, message.createdAt)) {
		newListInfo.groupCounts.push(1);
		newListInfo.groupLabels.push(message.createdAt);
	} else {
		newListInfo.groupCounts[newListInfo.groupCounts.length - 1]++;
	}

	newListInfo.items.push({
		id: message.id,
		type: "message",
		message,
		uiProps: {
			showUserInfo:
				message.sender.id !== prevMessage.message.sender.id ||
				!isSameDate(prevMessage.message.createdAt, message.createdAt)
		}
	});

	return newListInfo;
};

export const deleteMessageFromList = (messageId: string) => {
	const idx = chatStore.listInfo.items.findIndex(item => item.id === messageId);

	if (idx === -1) {
		return;
	}

	let groupIndex = 0;
	let iter = idx;

	while (groupIndex < chatStore.listInfo.groupCounts.length && iter >= 0) {
		if (iter < chatStore.listInfo.groupCounts[groupIndex]) {
			break;
		}

		iter -= chatStore.listInfo.groupCounts[groupIndex];
		groupIndex++;
	}

	if (chatStore.listInfo.groupCounts[groupIndex] === 1) {
		chatStore.listInfo.groupCounts.splice(groupIndex, 1);
		chatStore.listInfo.groupLabels.splice(groupIndex, 1);
	} else {
		chatStore.listInfo.groupCounts[groupIndex]--;

		const messageAfterDeleted = chatStore.listInfo.items[idx + 1];

		if (messageAfterDeleted?.type === "message") {
			const messageBeforeDeleted = chatStore.listInfo.items[idx - 1];

			messageAfterDeleted.uiProps.showUserInfo =
				messageBeforeDeleted?.type === "message"
					? messageBeforeDeleted.message.sender.id !==
						messageAfterDeleted.message.sender.id
					: true;
		}
	}

	chatStore.listInfo.items.splice(idx, 1);
};

export const prepareList = (messages: MessageData[]): ListInfo => {
	if (!messages.length) {
		return {
			items: [],
			groupCounts: [],
			groupLabels: []
		};
	}

	const groupCounts: number[] = [];
	const groupLabels: string[] = [];
	const items: MessageListItem[] = [];

	let currentGroupCount = messages.length > 1 ? 2 : 1;

	items.push({
		id: messages[0].id,
		type: "message",
		message: messages[0],
		uiProps: {
			showUserInfo: true
		}
	});

	for (let i = 1; i < messages.length; i++) {
		const message = messages[i];
		const nextMessage = messages[i + 1];

		if (nextMessage) {
			if (!isSameDate(message.createdAt, nextMessage.createdAt)) {
				groupCounts.push(currentGroupCount);
				groupLabels.push(message.createdAt);

				currentGroupCount = 1;
			} else {
				currentGroupCount++;
			}
		}

		const prevMessage = messages[i - 1];
		const prevMessageSameDay = isSameDate(message.createdAt, prevMessage.createdAt);

		items.push({
			id: message.id,
			type: "message",
			message,
			uiProps: {
				showUserInfo: message.sender.id !== prevMessage.sender.id || !prevMessageSameDay
			}
		});
	}

	groupCounts.push(currentGroupCount);
	groupLabels.push(messages[messages.length - 1].createdAt);

	return {
		items,
		groupCounts,
		groupLabels
	};
};

const mergeLists = (currentList: ListInfo, newList: ListInfo): ListInfo => {
	const lastGroupLabelOfNewList = newList.groupLabels[newList.groupLabels.length - 1];
	const firstGroupLabelOfCurrentList = currentList.groupLabels[0];

	if (isSameDate(lastGroupLabelOfNewList, firstGroupLabelOfCurrentList)) {
		const firstMessageOfCurrentList = currentList.items[0] as MessageListItemMessage;

		const mergedList: ListInfo = {
			groupCounts: [
				...newList.groupCounts.slice(0, -1),
				newList.groupCounts[newList.groupCounts.length - 1] + currentList.groupCounts[0],
				...currentList.groupCounts.slice(1)
			],
			groupLabels: [...newList.groupLabels, ...currentList.groupLabels.slice(1)],
			items: [
				...newList.items,
				{
					type: "message",
					id: firstMessageOfCurrentList.id,
					message: firstMessageOfCurrentList.message,
					uiProps: {
						showUserInfo:
							(newList.items[newList.items.length - 1] as MessageListItemMessage)
								.message.sender.id !== firstMessageOfCurrentList.message.sender.id
					}
				},
				...currentList.items.slice(1)
			]
		};

		return mergedList;
	}

	return {
		groupCounts: [...newList.groupCounts, ...currentList.groupCounts],
		groupLabels: [...newList.groupLabels, ...currentList.groupLabels],
		items: [...newList.items, ...currentList.items]
	};
};

export const addNewMessagesToList = (
	newMessages: MessageData[],
	action: "prepend" | "append" = "prepend"
): void => {
	const newList = prepareList(newMessages);

	chatStore.listInfo = action === "prepend"
		? mergeLists(chatStore.listInfo, newList)
		: mergeLists(newList, chatStore.listInfo);
};

