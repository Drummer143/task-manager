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

// export const deleteMessage = (listInfo: ListInfo, messageId: string): ListInfo => {
// 	const newListInfo = {
// 		items: [...listInfo.items],
// 		groupCounts: [...listInfo.groupCounts],
// 		groupLabels: [...listInfo.groupLabels]
// 	};

// 	const idx = newListInfo.items.findIndex(item => item.id === messageId);

// 	if (idx === -1) {
// 		return listInfo;
// 	}

// 	const itemBefore = newListInfo.items[idx - 1];
// 	const itemAfter = newListInfo.items[idx + 1];

// 	return newListInfo;
// };

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
	currentList: ListInfo,
	newMessages: MessageData[],
	action: "prepend" | "append" = "prepend"
): ListInfo => {
	const newList = prepareList(newMessages);

	return action === "prepend"
		? mergeLists(currentList, newList)
		: mergeLists(newList, currentList);
};

