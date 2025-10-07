import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { App } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { LogLevel, Virtuoso, VirtuosoHandle } from "react-virtuoso";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { useChatStore } from "./store";
import { useStyles } from "./styles";
import { ChatProps, MessageData, MessageListItem, MessageListItemMessage } from "./types";
import ContextMenu from "./ui/ContextMenu";
import NewMessageInput from "./ui/NewMessageInput";
import TypingBar from "./ui/TypingBar";
import {
	prepareMessagesBeforeRender,
	removeMessageById,
	transformSingleMessage,
	updateMessageByNextMessage
} from "./utils";

const debugMode = /*import.meta.env.DEV ? LogLevel.DEBUG : */ LogLevel.ERROR;

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

				setListItems(prev => {
					messages.unshift((prev.at(-1) as MessageListItemMessage).message);

					return [...prev.slice(0, -1), ...prepareMessagesBeforeRender(messages)];
				});
			},
			{
				before: (listItems.at(-1) as MessageListItemMessage).message.createdAt,
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
			setListItems(prev => {
				const lastMessage = prev[0] as MessageListItemMessage;

				const transformedMessage = transformSingleMessage(message, lastMessage.message);

				return [
					...transformedMessage,
					updateMessageByNextMessage(lastMessage, message),
					...prev.slice(1)
				];
			});

			if (message.sender.id === currentUserId) {
				requestAnimationFrame(() => {
					virtuosoRef.current?.scrollToIndex({
						index: 0,
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
					const updatedIdx = prev.findIndex(item => item.id === message.id);

					if (updatedIdx === -1) {
						return prev.concat(message);
					}

					const copy = [...prev];

					copy.splice(updatedIdx + 1, 0, message);

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

	console.debug({ pins });

	return (
		<div className={cx(styles.wrapper, className)}>
			{pins.length > 0 && <div>{pins.length}</div>}
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
					alignToBottom
					logLevel={debugMode}
					endReached={handleLoadMoreMessage}
					defaultItemHeight={32}
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
								typingUsers={[{ id: "1", username: "user1", avatar: null }]}
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

