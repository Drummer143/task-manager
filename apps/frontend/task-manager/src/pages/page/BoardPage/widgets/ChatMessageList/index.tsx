import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { getMessages, ResponseWithPagination, TaskChatMessage } from "@task-manager/api";
import { Divider } from "antd";
import { createStyles } from "antd-style";
import dayjs from "dayjs";

import ChatMessage from "../ChatMessage";

interface ChatMessageListProps {
	workspaceId: string;
	pageId: string;
	taskId: string;
	enabled: boolean;
}

const useStyles = createStyles(({ css }) => ({
	container: css`
		flex: 1;

		display: flex;
		flex-direction: column;
		justify-content: flex-end;

		overflow: hidden;
	`,
	scroll: css`
		max-height: 100%;

		padding: 0 var(--ant-padding);

		overflow-y: auto;
	`,
	dateDivider: css`
		margin: var(--ant-margin-xs) 0 !important;

		&:first {
			margin-top: 0 !important;
		}
	`
}));

const ChatMessageList: React.FC<ChatMessageListProps> = ({
	pageId,
	taskId,
	workspaceId,
	enabled
}) => {
	const [items, setItems] = useState<TaskChatMessage[]>([]);

	const { container, dateDivider, scroll } = useStyles().styles;

	const scrollRef = useRef<HTMLDivElement>(null);
	const firstSkipped = useRef(false);
	const observerTargetRef = useRef<HTMLDivElement>(null);

	const { data, isFetching, hasNextPage, isPlaceholderData, fetchNextPage } = useInfiniteQuery<
		ResponseWithPagination<TaskChatMessage>,
		Error,
		InfiniteData<ResponseWithPagination<TaskChatMessage>, number>,
		readonly unknown[],
		number
	>({
		queryKey: ["chat", taskId],
		initialPageParam: 0,
		enabled,
		getNextPageParam: lastPage =>
			lastPage.meta.hasMore ? lastPage.meta.offset + lastPage.meta.limit : undefined,
		queryFn: ({ pageParam }) =>
			getMessages({ pageId, taskId, workspaceId, limit: 20, offset: pageParam }),
		refetchOnWindowFocus: false,
		refetchInterval: 0,
		placeholderData: {
			pages: [{ data: [], meta: { total: 0, limit: 10, offset: 0, hasMore: true } }],
			pageParams: [0]
		}
	});

	const requestMetaRef = useRef({ hasNextPage, isFetching, isPlaceholderData, fetchNextPage });

	const renderChatMessages = useCallback(
		(messages: TaskChatMessage[]) => {
			if (!messages.length) {
				return null;
			}

			let currentDay = dayjs(messages[0].createdAt).format("DD MM YYYY");

			const jsx = messages.reduce((acc, message, index) => {
				const day = dayjs(message.createdAt).format("DD MM YYYY");

				if (currentDay !== day) {
					acc.unshift(
						<Divider className={dateDivider} key={currentDay}>
							{currentDay}
						</Divider>
					);
					currentDay = day;
				}

				acc.unshift(<ChatMessage key={message.id} {...message} />);

				return acc;
			}, [] as React.ReactNode[]);

			jsx.unshift(
				<Divider className={dateDivider} key={currentDay}>
					{currentDay}
				</Divider>
			);

			return jsx;
		},
		[dateDivider]
	);

	useLayoutEffect(() => {
		if (enabled) {
			setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
		}
	}, [enabled, isPlaceholderData]);

	useEffect(() => {
		if (!enabled) {
			firstSkipped.current = false;
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				if (
					!requestMetaRef.current.hasNextPage &&
					!requestMetaRef.current.isPlaceholderData
				) {
					return observer.disconnect();
				}

				if (!entries[0].isIntersecting) {
					return;
				}

				if (!firstSkipped.current) {
					firstSkipped.current = true;
					return;
				}

				if (!requestMetaRef.current.isFetching && !requestMetaRef.current.isFetching) {
					requestMetaRef.current.fetchNextPage();
				} else if (requestMetaRef.current.isFetching || requestMetaRef.current.isFetching) {
					const interval = setInterval(() => {
						if (
							!requestMetaRef.current.isFetching &&
							!requestMetaRef.current.isFetching
						) {
							requestMetaRef.current.fetchNextPage();
							clearInterval(interval);
						}
					}, 250);
				}
			},
			{ rootMargin: "200px" }
		);

		const currentElement = observerTargetRef.current;

		if (currentElement) {
			observer.observe(currentElement);
		}

		return () => {
			observer.disconnect();
		};
	}, [enabled]);

	useEffect(() => {
		if (data?.pages[0].data?.[0]) {
			setItems(data.pages.flatMap(page => page.data));
		} else {
			setItems([]);
		}
	}, [data]);

	useEffect(() => {
		requestMetaRef.current = { hasNextPage, isFetching, isPlaceholderData, fetchNextPage };
	}, [fetchNextPage, hasNextPage, isFetching, isPlaceholderData]);

	return (
		<div className={container}>
			<div ref={scrollRef} className={scroll}>
				<div ref={observerTargetRef} />

				{renderChatMessages(items)}
			</div>
		</div>
	);
};

export default ChatMessageList;

