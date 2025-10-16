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

	let currentGroupCount = 1;

	items.push(
		{
			type: "placeholder",
			id: `${messages[0].id}-placeholder`
		},
		{
			id: messages[0].id,
			type: "message",
			message: messages[0],
			uiProps: {
				showUserInfo: true
			}
		}
	);

	for (let i = 1; i < messages.length; i++) {
		const message = messages[i];
		const prevMessage = messages[i - 1];

		const prevMessageSameDay = isSameDate(prevMessage.createdAt, message.createdAt);

		if (prevMessageSameDay) {
			currentGroupCount++;
		} else {
			groupCounts.push(currentGroupCount);
			groupLabels.push(prevMessage.createdAt);
			currentGroupCount = 1;

			items.push({
				type: "placeholder",
				id: `${message.id}-placeholder`
			});
		}

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
		const firstMessageOfCurrentList = currentList.items[1] as MessageListItemMessage;

		return {
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
				...currentList.items.slice(2)
			]
		};
	}

	return {
		groupCounts: [...newList.groupCounts, ...currentList.groupCounts],
		groupLabels: [...newList.groupLabels, ...currentList.groupLabels],
		items: [...newList.items, ...currentList.items]
	};
};

export const prependMessages = (currentList: ListInfo, newMessages: MessageData[]): ListInfo => {
	const newList = prepareList(newMessages);

	return mergeLists(currentList, newList);
};

