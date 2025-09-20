import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useIntersectionObserver } from "@task-manager/react-utils";
import { List } from "antd";
import { AnimatePresence, motion } from "framer-motion";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { useStyles } from "./styles";
import { ChatProps, MessageListItem, MessageListItemMessage } from "./types";
import NewMessageInput from "./ui/NewMessageInput";
import TypingBar from "./ui/TypingBar";
import {
	prepareMessagesBeforeRender,
	transformSingleMessage,
	updateMessageByNextMessage
} from "./utils";

const Chat: React.FC<ChatProps> = ({
	currentUserId,
	onUserClick,
	loadMessages,
	sendMessage,
	subscribe,
	presence,
	className,
	onTypingChange
}) => {
	const [listItems, setListItems] = useState<MessageListItem[]>([]);
	// const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

	const renderMessage = useMessageRenderer(currentUserId, onUserClick, selection);

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

	const handleIntersection = useCallback<IntersectionObserverCallback>(
		([entry]) => {
			const scrollBottom = listRef.current
				? listRef.current.scrollHeight - listRef.current.scrollTop
				: undefined;

			if (entry.isIntersecting) {
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
			}
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

		return subscribe(message => {
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
	}, [currentUserId, subscribe, loadMessages, scrollToBottom]);

	return (
		<div className={cx(styles.wrapper, className)}>
			<List
				ref={listRef}
				className={styles.messageList}
				dataSource={listItems}
				renderItem={renderMessage}
				loadMore={<div className={styles.sentinel} ref={sentinelRef} />}
			/>

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

