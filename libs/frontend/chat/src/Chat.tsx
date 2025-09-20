import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useIntersectionObserver } from "@task-manager/react-utils";
import { App, List, MenuProps } from "antd";
import { AnimatePresence, motion } from "framer-motion";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { useStyles } from "./styles";
import { ChatProps, MessageListItem, MessageListItemMessage } from "./types";
import ContextMenu from "./ui/ContextMenu";
import NewMessageInput from "./ui/NewMessageInput";
import TypingBar from "./ui/TypingBar";
import {
	prepareMessagesBeforeRender,
	removeMessageById,
	transformSingleMessage,
	updateMessageByNextMessage
} from "./utils";

const Chat: React.FC<ChatProps> = ({
	currentUserId,
	onUserClick,
	loadMessages,
	sendMessage,
	subscribeToNewMessages,
	subscribeToDeletedMessages,
	presence,
	className,
	onTypingChange,
	deleteMessage
}) => {
	const modal = App.useApp().modal;

	const [listItems, setListItems] = useState<MessageListItem[]>([]);
	const [contextMenuParams, setContextMenuParams] = useState<
		{ idx: number; menu: MenuProps } | undefined
	>(undefined);
	// const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

	const renderMessage = useMessageRenderer(currentUserId, onUserClick, contextMenuParams?.idx);

	const { styles, cx } = useStyles();

	const listRef = useRef<HTMLDivElement | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const intersectionOptions = useMemo(
		() => ({
			root: listRef.current,
			rootMargin: "200px"
		}),
		[]
	);

	const scrollToBottom = useCallback(() => {
		listRef.current?.scrollTo({
			top: listRef.current.scrollHeight
		});
	}, []);

	// const handleSeeNewMessagesClick = useCallback(() => {
	// 	setShowScrollBottomButton(false);
	// 	scrollToBottom();
	// }, [scrollToBottom]);

	const handleDeleteMessage = useMemo(() => {
		if (!deleteMessage) {
			return;
		}

		return async (id: string) => {
			modal.confirm({
				title: "Delete message",
				content: "Are you sure you want to delete this message?",
				onOk: () => {
					deleteMessage(id);
				}
			});
		};
	}, [deleteMessage, modal]);

	const handleIntersection = useCallback<IntersectionObserverCallback>(
		([entry]) => {
			const scrollBottom = listRef.current
				? listRef.current.scrollHeight - listRef.current.scrollTop
				: undefined;

			if (!entry.isIntersecting) {
				return;
			}

			loadMessages(
				messages => {
					if (!messages.length) {
						return;
					}

					setListItems(prev => {
						messages.push((prev[0] as MessageListItemMessage).message);

						return [...prepareMessagesBeforeRender(messages), ...prev.slice(1)];
					});

					requestAnimationFrame(() => {
						if (scrollBottom) {
							listRef.current?.scrollTo({
								top: listRef.current.scrollHeight - scrollBottom
							});
						}
					});
				},
				(listItems[0] as MessageListItemMessage).message.createdAt
			);
		},
		[loadMessages, listItems]
	);

	useIntersectionObserver({
		target: sentinelRef.current,
		onIntersection: handleIntersection,
		options: intersectionOptions
	});

	useEffect(() => {
		loadMessages(messages => {
			setListItems(prepareMessagesBeforeRender(messages));
			requestAnimationFrame(scrollToBottom);
		});

		const unsubscribeFromNewMessage = subscribeToNewMessages(message => {
			setListItems(prev => {
				const lastMessage = prev[prev.length - 1] as MessageListItemMessage;

				const transformedMessage = transformSingleMessage(message, lastMessage.message);

				return [
					...prev.slice(0, prev.length - 1),
					updateMessageByNextMessage(lastMessage, message),
					...transformedMessage
				];
			});

			if (message.sender.id === currentUserId) {
				requestAnimationFrame(scrollToBottom);
				// } else {
				// 	setShowScrollBottomButton(true);
			}
		});

		const unsubscribeFromDeletedMessage = subscribeToDeletedMessages(({ id }) => {
			setListItems(prev => {
				const newList = removeMessageById(prev, id);

				return newList;
			});
		});

		return () => {
			unsubscribeFromNewMessage();
			unsubscribeFromDeletedMessage();
		};
	}, [
		currentUserId,
		subscribeToNewMessages,
		loadMessages,
		scrollToBottom,
		subscribeToDeletedMessages
	]);

	return (
		<div className={cx(styles.wrapper, className)}>
			<ContextMenu
				listItems={listItems}
				currentUserId={currentUserId}
				contextMenuParams={contextMenuParams}
				setContextMenuParams={setContextMenuParams}
				handleDeleteMessage={handleDeleteMessage}
			>
				<List
					ref={listRef}
					className={styles.messageList}
					dataSource={listItems}
					renderItem={renderMessage}
					loadMore={<div className={styles.sentinel} ref={sentinelRef} />}
				/>
			</ContextMenu>

			<div className={styles.bottomContent}>
				{/* {showScrollBottomButton && (
					<Button
						className={styles.seeNewMessagesButton}
						onClick={handleSeeNewMessagesClick}
					>
						See new messages
					</Button>
				)} */}

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

