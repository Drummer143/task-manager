/* eslint-disable max-lines */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { App } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { GroupedVirtuoso, GroupedVirtuosoHandle } from "react-virtuoso";
import { subscribe, useSnapshot } from "valtio";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { chatStore, INITIAL_LIMIT, LOAD_MORE_LIMIT } from "./state";
import { useStyles } from "./styles";
import { ChatProps, MessageData, MessageListItem, MessageListItemMessage } from "./types";
import ContextMenu from "./ui/ContextMenu";
import Divider from "./ui/Divider";
import NewMessageInput from "./ui/NewMessageInput";
import PinnedBar from "./ui/PinnedBar";
import TypingBar from "./ui/TypingBar";
import { addNewMessagesToList, prepareList, pushMessage } from "./utils/messageListProcessors";

const computeItemKey = (index: number, item?: MessageListItem) => item?.id ?? index;

const increaseViewportBy = {
	bottom: 300,
	top: 300
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

	const chatStoreSnapshot = useSnapshot(chatStore);

	const [pins, setPins] = useState<MessageData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [isScrolling, setIsScrolling] = useState(false);

	const renderMessage = useMessageRenderer(currentUserId, onUserClick);

	const { styles, cx } = useStyles();

	const isFetchingMessages = useRef(true);
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

				if (response.messages.length) {
					chatStore.firstItemIndex = chatStore.firstItemIndex - response.messages.length;
					chatStore.listInfo = addNewMessagesToList(
						chatStore.listInfo,
						response.messages
					);
				}

				isFetchingMessages.current = false;
			},
			{
				before: (chatStore.listInfo.items[0] as MessageListItemMessage).message.createdAt,
				limit: LOAD_MORE_LIMIT
			}
		);
	}, [loadMessages]);

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

				if (response.messages.length) {
					chatStore.listInfo = addNewMessagesToList(
						chatStore.listInfo,
						response.messages,
						"append"
					);
				}

				isFetchingMessages.current = false;
			},
			{
				limit: LOAD_MORE_LIMIT,
				after: (
					chatStore.listInfo.items[
						chatStore.listInfo.items.length - 1
					] as MessageListItemMessage
				).message.createdAt
			}
		);
	}, [loadMessages]);

	const handleIsScrolling = useCallback((isScrolling: boolean) => {
		setIsScrolling(isScrolling);

		if (isScrolling && chatStore.ctxOpen) {
			chatStore.ctxItemId = undefined;
			chatStore.ctxOpen = false;
		}
	}, []);

	const handleScrollToMessage = useCallback(
		(messageId: string) => {
			if (isFetchingMessages.current) {
				return;
			}

			isProgrammaticScrolling.current = true;

			const idx = chatStore.listInfo.items.findIndex(item => item.id === messageId);

			chatStore.highlightedItemId = messageId;

			if (idx === -1) {
				isFetchingMessages.current = true;

				return loadMessagesAround(
					response => {
						hasMore.current.top = response.hasMoreOnTop;
						hasMore.current.bottom = response.hasMoreOnBottom;

						chatStore.listInfo = prepareList(response.messages);
						chatStore.firstItemIndex = response.firstMessagePosition;

						virtuosoRef.current?.scrollToIndex({
							index: response.targetPosition,
							align: "center",
							behavior: "auto"
						});

						isFetchingMessages.current = false;
					},
					messageId,
					INITIAL_LIMIT
				);
			}

			virtuosoRef.current?.scrollToIndex({
				index: idx,
				align: "center",
				behavior: "smooth"
			});
		},
		[loadMessagesAround]
	);

	const renderGroup = useCallback(
		(index: number) => <Divider date={chatStore.listInfo.groupLabels[index]} />,
		[]
	);

	useEffect(() => {
		loadMessages(
			response => {
				chatStore.listInfo = prepareList(response.messages);

				if (response.total) {
					chatStore.firstItemIndex = response.total - response.messages.length - 1;
				}

				setLoading(false);
				hasMore.current.bottom = false;
				hasMore.current.top = response.hasMoreOnTop;
				isFetchingMessages.current = false;
			},
			{
				limit: INITIAL_LIMIT,
				countTotal: true
			}
		);

		loadPins?.(setPins);

		const unsubscribeFromNewMessage = subscribeToNewMessages(message => {
			chatStore.listInfo = pushMessage(chatStore.listInfo, message);

			if (message.sender.id === currentUserId) {
				requestAnimationFrame(() => {
					virtuosoRef.current?.scrollToIndex({
						index: chatStore.listInfo.items.length - 1,
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
		return subscribe(chatStore, () => {
			if (chatStore.scrollToItemId) {
				handleScrollToMessage(chatStore.scrollToItemId);

				chatStore.scrollToItemId = undefined;
			} else if (chatStore.edit?.text) {
				updateMessage?.(chatStore.edit.messageId, chatStore.edit.text);

				chatStore.edit = undefined;
			} else if (chatStore.highlightedViewed && !chatStore.highlightedTimeoutId) {
				chatStore.highlightedTimeoutId = setTimeout(() => {
					chatStore.highlightedItemId = undefined;
					chatStore.highlightedViewed = undefined;
					chatStore.highlightedTimeoutId = undefined;
				}, 2500);
			}
		});
	}, [handleScrollToMessage, updateMessage]);

	return (
		<div className={cx(styles.wrapper, className)}>
			<PinnedBar pins={pins} onPinClick={handleScrollToMessage} />

			{!loading && (
				<ContextMenu
					currentUserId={currentUserId}
					handleDeleteMessage={handleDeleteMessage}
					handleUpdateMessage={updateMessage}
					handlePinMessage={pinMessage}
				>
					<GroupedVirtuoso
						className={styles.messageList}
						ref={virtuosoRef}
						groupCounts={chatStoreSnapshot.listInfo.groupCounts as number[]}
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
						firstItemIndex={chatStoreSnapshot.firstItemIndex}
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

