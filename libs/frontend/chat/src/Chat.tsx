import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useIntersectionObserver } from "@task-manager/react-utils";
import { Button, List } from "antd";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { useStyles } from "./styles";
import { ChatProps, MessageListItem, MessageListItemMessage } from "./types";
import NewMessageInput from "./ui/NewMessageInput";
import { prepareMessagesBeforeRender, transformSingleMessage } from "./utils";

const Chat: React.FC<ChatProps> = ({
	currentUserId,
	onUserClick,
	loadMessages,
	sendMessage,
	subscribe
}) => {
	const [listItems, setListItems] = useState<MessageListItem[]>([]);
	// const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

	const renderMessage = useMessageRenderer(listItems, currentUserId, onUserClick);

	const styles = useStyles().styles;

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
				loadMessages(messages => {
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
				}, (listItems[0] as MessageListItemMessage).message.createdAt);
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
			if (message.sender.id === currentUserId) {
				requestAnimationFrame(scrollToBottom);
				// } else {
				// 	setShowScrollBottomButton(true);
			}

			setListItems(prev => {
				return [
					...prev,
					...transformSingleMessage(
						message,
						(prev[prev.length - 1] as MessageListItemMessage).message
					)
				];
			});
		});
	}, [currentUserId, subscribe, loadMessages, scrollToBottom]);

	return (
		<div className={styles.wrapper}>
			<List
				ref={listRef}
				className={styles.messageList}
				dataSource={listItems}
				renderItem={renderMessage}
				loadMore={<div className={styles.sentinel} ref={sentinelRef} />}
			/>

			{/* <div className={styles.bottomContent}>
				{showScrollBottomButton && (
					<Button
						className={styles.seeNewMessagesButton}
						onClick={handleSeeNewMessagesClick}
					>
						See new messages
					</Button>
				)} */}

			<NewMessageInput onSend={sendMessage} />
			{/* </div> */}
		</div>
	);
};

export default memo(Chat);

