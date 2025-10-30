/* eslint-disable max-lines */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { App } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { GroupedVirtuoso, GroupedVirtuosoHandle } from "react-virtuoso";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { useChatStore } from "./store";
import { useStyles } from "./styles";
import { ChatProps, MessageData, MessageListItem, MessageListItemMessage } from "./types";
import ContextMenu from "./ui/ContextMenu";
import Divider from "./ui/Divider";
import NewMessageInput from "./ui/NewMessageInput";
import PinnedBar from "./ui/PinnedBar";
import TypingBar from "./ui/TypingBar";
import { addNewMessagesToList, prepareList, pushMessage } from "./utils/messageListProcessors";

const computeItemKey = (index: number, item?: MessageListItem) => item?.id ?? index;

const LIMIT = 25;
const INITIAL_MAX_ITEMS = 1_000_000;

const increaseViewportBy = {
	bottom: 0,
	top: 500
};

const Chat: React.FC<ChatProps> = ({
	currentUserId,
	onUserClick,
	loadMessages,
	sendMessage,
	subscribeToNewMessages,
	subscribeToDeletedMessages,
	subscribeToUpdatedMessages,
	presence,
	className,
	onTypingChange,
	deleteMessage,
	updateMessage,
	pinMessage,
	loadPins,
	loadMessagesAround
}) => {
	const modal = App.useApp().modal;

	const [pins, setPins] = useState<MessageData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [isScrolling, setIsScrolling] = useState(false);
	const [firstItemIndex, setFirstItemIndex] = useState(INITIAL_MAX_ITEMS - LIMIT);
	const [listInfo, setListInfo] = useState<ReturnType<typeof prepareList>>({
		items: [],
		groupCounts: [],
		groupLabels: []
	});

	const renderMessage = useMessageRenderer(
		currentUserId,
		listInfo.items,
		firstItemIndex,
		onUserClick
	);

	const scrollToMessageId = useChatStore(state => state.scrollToItemId);

	const { styles, cx } = useStyles();

	const isFetchingMessages = useRef(false);
	const queuedLoadMore = useRef<"top" | "bottom" | false>(false);
	const isProgrammaticScrolling = useRef(false);
	const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);
	const hasMore = useRef({
		top: false,
		bottom: false
	});

	const handleDeleteMessage = useMemo(() => {
		if (!deleteMessage) {
			return;
		}

		return async (id: string) => {
			modal.confirm({
				title: "Delete message",
				content: "Are you sure you want to delete this message?",
				onOk: () => deleteMessage(id)
			});
		};
	}, [deleteMessage, modal]);

	const handleLoadMoreMessageOnTop = useCallback(() => {
		if (isFetchingMessages.current || !hasMore.current.top) {
			return;
		}

		if (isProgrammaticScrolling.current) {
			queuedLoadMore.current = "top";
			return;
		}

		isFetchingMessages.current = true;

		loadMessages(
			response => {
				hasMore.current.top = response.hasMoreOnTop;

				if (!response.messages.length) {
					return;
				}

				setFirstItemIndex(prev => prev - response.messages.length);
				setListInfo(prev => addNewMessagesToList(prev, response.messages));

				isFetchingMessages.current = false;
			},
			{
				before: (listInfo.items[0] as MessageListItemMessage).message.createdAt,
				limit: LIMIT
			}
		);
	}, [loadMessages, listInfo]);

	const handleLoadMoreMessageOnBottom = useCallback(() => {
		if (isFetchingMessages.current || !hasMore.current.bottom) {
			return;
		}

		if (isProgrammaticScrolling.current) {
			queuedLoadMore.current = "bottom";
			return;
		}

		isFetchingMessages.current = true;

		loadMessages(
			response => {
				hasMore.current.bottom = response.hasMoreOnBottom;

				if (!response.messages.length) {
					return;
				}

				setListInfo(prev => addNewMessagesToList(prev, response.messages, "append"));

				isFetchingMessages.current = false;
			},
			{
				limit: LIMIT,
				after: (listInfo.items[listInfo.items.length - 1] as MessageListItemMessage).message
					.createdAt
			}
		);
	}, [loadMessages, listInfo]);

	const handleIsScrolling = useCallback((isScrolling: boolean) => {
		setIsScrolling(isScrolling);

		if (isScrolling) {
			useChatStore.setState({ ctxMenuId: undefined, ctxOpen: false });
		}
	}, []);

	const handleScrollToMessage = useCallback(
		(messageId: string) => {
			if (isFetchingMessages.current) {
				return;
			}

			isProgrammaticScrolling.current = true;

			let idx = 0;

			while (idx < listInfo.items.length) {
				if (listInfo.items[idx].id === messageId) {
					break;
				}

				idx++;
			}

			useChatStore.setState({ highlightedItemId: messageId });

			if (idx >= listInfo.items.length) {
				isFetchingMessages.current = true;

				return loadMessagesAround(
					response => {
						hasMore.current.top = response.hasMoreOnTop;
						hasMore.current.bottom = response.hasMoreOnBottom;

						setListInfo(prepareList(response.messages));
						setFirstItemIndex(response.firstMessagePosition);

						setTimeout(() => {
							virtuosoRef.current?.scrollToIndex({
								index: response.targetPosition,
								align: "center",
								behavior: "auto"
							});

							requestAnimationFrame(() => {
								isFetchingMessages.current = false;
							});
						}, 500);
					},
					messageId,
					LIMIT
				);
			}

			virtuosoRef.current?.scrollToIndex({
				index: idx,
				align: "center",
				behavior: "smooth"
			});
		},
		[listInfo.items, loadMessagesAround]
	);

	const renderGroup = useCallback(
		(index: number) => <Divider date={listInfo.groupLabels[index]} />,
		[listInfo.groupLabels]
	);

	useEffect(() => {
		loadMessages(
			response => {
				hasMore.current.bottom = false;
				hasMore.current.top = response.hasMoreOnTop;

				if (response.total) {
					setFirstItemIndex(response.total - response.messages.length);
				}

				setListInfo(prepareList(response.messages));
				setLoading(false);
			},
			{
				limit: LIMIT,
				countTotal: true
			}
		);

		loadPins?.(setPins);

		const unsubscribeFromNewMessage = subscribeToNewMessages(message => {
			let idx = 0;

			setListInfo(prev => {
				const result = pushMessage(prev, message);

				idx = result.items.length - 1;

				return result;
			});

			if (message.sender.id === currentUserId) {
				requestAnimationFrame(() => {
					virtuosoRef.current?.scrollToIndex({
						index: idx,
						align: "end",
						behavior: "smooth"
					});
				});
			}
		});

		// const unsubscribeFromDeletedMessage = subscribeToDeletedMessages(({ id }) => {
		// 	setListItems(prev => {
		// 		const newList = removeMessageById(prev, id);

		// 		return newList;
		// 	});
		// });

		// const unsubscribeFromUpdatedMessage = subscribeToUpdatedMessages(({ action, message }) => {
		// 	if (action === "pin") {
		// 		setPins(prev => {
		// 			const messageCreatedAt = new Date(message.createdAt).getTime();

		// 			const updatedIdx = prev.findIndex(
		// 				item => messageCreatedAt > new Date(item.createdAt).getTime()
		// 			);

		// 			if (updatedIdx === -1) {
		// 				return prev.concat(message);
		// 			}

		// 			const copy = [...prev];

		// 			copy.splice(updatedIdx - 1, 0, message);

		// 			return copy;
		// 		});
		// 	} else if (action === "unpin") {
		// 		setPins(prev => prev.filter(item => item.id !== message.id));
		// 	}

		// 	setListItems(prev => {
		// 		const updatedIdx = prev.findIndex(item => item.id === message.id);

		// 		if (updatedIdx === -1) {
		// 			return prev;
		// 		}

		// 		const copy = [...prev];

		// 		(copy[updatedIdx] as MessageListItemMessage).message = {
		// 			...(copy[updatedIdx] as MessageListItemMessage).message,
		// 			...message
		// 		};

		// 		return copy;
		// 	});
		// });

		return () => {
			unsubscribeFromNewMessage();
			// unsubscribeFromDeletedMessage();
			// unsubscribeFromUpdatedMessage();
		};
	}, [
		currentUserId,
		subscribeToNewMessages,
		loadMessages,
		subscribeToDeletedMessages,
		subscribeToUpdatedMessages,
		loadPins
	]);

	useEffect(() => {
		if (!isScrolling && isProgrammaticScrolling.current) {
			isProgrammaticScrolling.current = false;

			if (queuedLoadMore.current) {
				setTimeout(
					queuedLoadMore.current === "top"
						? handleLoadMoreMessageOnTop
						: handleLoadMoreMessageOnBottom,
					500
				);
				queuedLoadMore.current = false;
			}
		}
	}, [handleLoadMoreMessageOnBottom, handleLoadMoreMessageOnTop, isScrolling]);

	useEffect(() => {
		if (!scrollToMessageId) {
			return;
		}

		handleScrollToMessage(scrollToMessageId);

		useChatStore.setState({ scrollToItemId: undefined });
	}, [handleScrollToMessage, scrollToMessageId]);

	return (
		<div className={cx(styles.wrapper, className)}>
			<PinnedBar pins={pins} onPinClick={handleScrollToMessage} />

			{!loading && (
				<ContextMenu
					listItems={listInfo.items}
					currentUserId={currentUserId}
					handleDeleteMessage={handleDeleteMessage}
					handleUpdateMessage={updateMessage}
					handlePinMessage={pinMessage}
				>
					<GroupedVirtuoso
						className={styles.messageList}
						ref={virtuosoRef}
						groupCounts={listInfo.groupCounts}
						groupContent={renderGroup}
						isScrolling={handleIsScrolling}
						computeItemKey={computeItemKey}
						itemContent={renderMessage}
						initialTopMostItemIndex={Number.MAX_SAFE_INTEGER}
						alignToBottom
						skipAnimationFrameInResizeObserver
						startReached={handleLoadMoreMessageOnTop}
						endReached={handleLoadMoreMessageOnBottom}
						increaseViewportBy={increaseViewportBy}
						// defaultItemHeight={32}
						firstItemIndex={firstItemIndex}
					/>
				</ContextMenu>
			)}

			<div className={styles.bottomContent}>
				<AnimatePresence>
					{!!presence?.typingUsers?.length && (
						<motion.div
							key="typing-bar"
							initial={{ y: 30 }}
							animate={{ y: 0 }}
							exit={{ y: 30 }}
							transition={{ duration: 0.05 }}
						>
							<TypingBar
								typingUsers={presence?.typingUsers}
								onUserClick={onUserClick}
							/>
						</motion.div>
					)}
				</AnimatePresence>

				<NewMessageInput
					hasTopBar={!!presence?.typingUsers?.length}
					onTypingChange={onTypingChange}
					onSend={sendMessage}
				/>
			</div>
		</div>
	);
};

export default memo(Chat);

