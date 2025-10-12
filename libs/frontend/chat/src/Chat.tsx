import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { App, Flex, Spin } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { useChatStore } from "./store";
import { useStyles } from "./styles";
import { ChatProps, MessageData, MessageListItem, MessageListItemMessage } from "./types";
import ContextMenu from "./ui/ContextMenu";
import NewMessageInput from "./ui/NewMessageInput";
import PinnedBar from "./ui/PinnedBar";
import TypingBar from "./ui/TypingBar";
import { prepareMessagesBeforeRender, removeMessageById, transformSingleMessage } from "./utils";

const computeItemKey = (_: unknown, item: MessageListItem) => item.id;

const LIMIT = 25;

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
	loadPins
}) => {
	const modal = App.useApp().modal;

	const [listItems, setListItems] = useState<MessageListItem[]>([]);
	const [pins, setPins] = useState<MessageData[]>([]);
	const [firstItemIndex, setFirstItemIndex] = useState(Number.MAX_SAFE_INTEGER - LIMIT);

	const renderMessage = useMessageRenderer(currentUserId, onUserClick);

	const { styles, cx } = useStyles();

	const virtuosoRef = useRef<VirtuosoHandle>(null);

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

	const handleLoadMoreMessage = useCallback(() => {
		loadMessages(
			messages => {
				if (!messages.length) {
					return;
				}

				setFirstItemIndex(prev => prev - LIMIT);
				setListItems(prev => {
					messages.push((prev.at(0) as MessageListItemMessage).message);

					return [...prepareMessagesBeforeRender(messages), ...prev.slice(1)];
				});
			},
			{
				before: (listItems[0] as MessageListItemMessage).message.createdAt,
				limit: LIMIT
			}
		);
	}, [loadMessages, listItems]);

	const handleIsScrolling = useCallback((isScrolling: boolean) => {
		if (isScrolling) {
			useChatStore.setState({ ctxMenuIdx: undefined, ctxOpen: false });
		}
	}, []);

	useEffect(() => {
		loadMessages(messages => setListItems(prepareMessagesBeforeRender(messages)), {
			limit: LIMIT
		});

		loadPins?.(setPins);

		const unsubscribeFromNewMessage = subscribeToNewMessages(message => {
			let idx = 0;

			setListItems(prev => {
				const lastMessage = prev.at(-1) as MessageListItemMessage;

				const transformedMessage = transformSingleMessage(message, lastMessage.message);

				const result = [...prev, ...transformedMessage];

				idx = result.length - 1;

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

		const unsubscribeFromDeletedMessage = subscribeToDeletedMessages(({ id }) => {
			setListItems(prev => {
				const newList = removeMessageById(prev, id);

				return newList;
			});
		});

		const unsubscribeFromUpdatedMessage = subscribeToUpdatedMessages(({ action, message }) => {
			if (action === "pin") {
				setPins(prev => {
					const messageCreatedAt = new Date(message.createdAt).getTime();

					const updatedIdx = prev.findIndex(
						item => messageCreatedAt > new Date(item.createdAt).getTime()
					);

					if (updatedIdx === -1) {
						return prev.concat(message);
					}

					const copy = [...prev];

					copy.splice(updatedIdx - 1, 0, message);

					return copy;
				});
			} else if (action === "unpin") {
				setPins(prev => prev.filter(item => item.id !== message.id));
			}

			setListItems(prev => {
				const updatedIdx = prev.findIndex(item => item.id === message.id);

				if (updatedIdx === -1) {
					return prev;
				}

				const copy = [...prev];

				(copy[updatedIdx] as MessageListItemMessage).message = {
					...(copy[updatedIdx] as MessageListItemMessage).message,
					...message
				};

				return copy;
			});
		});

		return () => {
			unsubscribeFromNewMessage();
			unsubscribeFromDeletedMessage();
			unsubscribeFromUpdatedMessage();
		};
	}, [
		currentUserId,
		subscribeToNewMessages,
		loadMessages,
		subscribeToDeletedMessages,
		subscribeToUpdatedMessages,
		loadPins
	]);

	return (
		<div className={cx(styles.wrapper, className)}>
			<PinnedBar pins={pins} />

			<ContextMenu
				listItems={listItems}
				currentUserId={currentUserId}
				handleDeleteMessage={handleDeleteMessage}
				handleUpdateMessage={updateMessage}
				handlePinMessage={pinMessage}
			>
				<Virtuoso
					className={styles.messageList}
					data={listItems}
					ref={virtuosoRef}
					isScrolling={handleIsScrolling}
					computeItemKey={computeItemKey}
					itemContent={renderMessage}
					initialTopMostItemIndex={LIMIT - 1}
					alignToBottom
					startReached={handleLoadMoreMessage}
					defaultItemHeight={32}
					firstItemIndex={firstItemIndex}
				/>
			</ContextMenu>

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

