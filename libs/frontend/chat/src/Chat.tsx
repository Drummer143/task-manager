import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useIntersectionObserver } from "@task-manager/react-utils";
import { Button, List } from "antd";

import { useMessageRenderer } from "./hooks/useMessageRenderer";
import { useStyles } from "./styles";
import { ChatProps, MessageData } from "./types";
import NewMessageInput from "./ui/NewMessageInput";

const Chat: React.FC<ChatProps> = ({
	currentUserId,
	onUserClick,
	loadMessages,
	sendMessage,
	subscribe
}) => {
	const [messages, setMessages] = useState<MessageData[]>([]);
	const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

	const renderMessage = useMessageRenderer(messages, currentUserId, onUserClick);

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

	const handleSeeNewMessagesClick = useCallback(() => {
		setShowScrollBottomButton(false);
		scrollToBottom();
	}, [scrollToBottom]);

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

					setMessages(prev => [...messages, ...prev]);

					requestAnimationFrame(() => {
						if (scrollBottom) {
							listRef.current?.scrollTo({
								top: listRef.current.scrollHeight - scrollBottom
							});
						}
					});
				}, messages[0].createdAt);
			}
		},
		[messages]
	);

	useIntersectionObserver({
		target: sentinelRef.current,
		onIntersection: handleIntersection,
		options: intersectionOptions
	});

	useEffect(() => {
		loadMessages(messages => {
			setMessages(messages);
			requestAnimationFrame(scrollToBottom);
		});

		return subscribe(message => {
			if (message.sender.id === currentUserId) {
				requestAnimationFrame(scrollToBottom);
			} else {
				setShowScrollBottomButton(true);
			}
			setMessages(messages => [...messages, message]);
		});
	}, [currentUserId, subscribe, loadMessages, scrollToBottom]);

	return (
		<div className={styles.wrapper}>
			<List
				ref={listRef}
				className={styles.messageList}
				dataSource={messages}
				renderItem={renderMessage}
				loadMore={<div className={styles.sentinel} ref={sentinelRef} />}
			/>

			<div className={styles.bottomContent}>
				{showScrollBottomButton && (
					<Button
						className={styles.seeNewMessagesButton}
						onClick={handleSeeNewMessagesClick}
					>
						See new messages
					</Button>
				)}

				<NewMessageInput onSend={sendMessage} />
			</div>
		</div>
	);
};

export default memo(Chat);

