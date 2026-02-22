import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import { InfiniteData, QueryKey, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationQuery, ResponseWithPagination } from "@task-manager/api";
import { List, ListProps, Spin } from "antd";

import { useStyles } from "./styles";

export interface ListWithInfiniteScrollProps<
	ItemValue,
	Response extends ResponseWithPagination<ItemValue> = ResponseWithPagination<ItemValue>
> extends Omit<ListProps<ItemValue>, "loading" | "dataSource" | "renderItem"> {
	queryKey: QueryKey;
	enabled?: boolean;
	visible?: boolean;
	extraParams?: Record<string, number | boolean | string | undefined | null>;

	fetchItems: (params: PaginationQuery) => Promise<Response>;
	renderItem: (
		item: Response["data"][number],
		index: number,
		array: Response["data"]
	) => React.ReactNode;
}

const ListWithInfiniteScroll = <
	ItemValue,
	Response extends ResponseWithPagination<ItemValue> = ResponseWithPagination<ItemValue>
>({
	enabled,
	extraParams,
	fetchItems,
	queryKey,
	loadMore,
	className,
	renderItem: propsRenderItem,
	...listProps
}: ListWithInfiniteScrollProps<ItemValue, Response>) => {
	const [items, setItems] = useState<ItemValue[]>([]);
	const observerRef = useRef<HTMLDivElement | null>(null);

	const queryClient = useQueryClient();

	const { styles, cx } = useStyles();

	const { data, isFetching, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery<
		Response,
		Error,
		InfiniteData<Response, number>,
		QueryKey,
		number
	>({
		queryKey,
		queryFn: ({ pageParam }) => fetchItems({ ...extraParams, offset: pageParam, limit: 10 }),
		getNextPageParam: lastPage =>
			lastPage.meta.hasMore ? lastPage.meta.offset + lastPage.meta.limit : undefined,
		initialPageParam: 0,
		enabled,
		initialData: {
			pageParams: [0],
			pages: [
				{
					data: [],
					meta: { total: 0, limit: 10, offset: 0, hasMore: true }
				} as unknown as Response
			]
		}
	});

	const requestMetaRef = useRef({ hasNextPage, isFetching, isLoading, fetchNextPage });

	useEffect(() => {
		if (data.pages[0].data?.[0]) {
			setItems(data.pages.flatMap(page => page.data));
		} else {
			setItems([]);
		}
	}, [data]);

	useEffect(() => {
		requestMetaRef.current = { hasNextPage, isFetching, isLoading, fetchNextPage };
	}, [fetchNextPage, hasNextPage, isFetching, isLoading]);

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [extraParams]);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				if (!requestMetaRef.current.hasNextPage) {
					return observer.disconnect();
				}
				if (
					entries[0].isIntersecting &&
					requestMetaRef.current.hasNextPage &&
					!requestMetaRef.current.isFetching &&
					!requestMetaRef.current.isLoading
				) {
					requestMetaRef.current.fetchNextPage();
				} else if (requestMetaRef.current.isFetching || requestMetaRef.current.isLoading) {
					const interval = setInterval(() => {
						if (
							!requestMetaRef.current.isFetching &&
							!requestMetaRef.current.isLoading
						) {
							requestMetaRef.current.fetchNextPage();
							clearInterval(interval);
						}
					}, 250);
				}
			},
			{ rootMargin: "100px" }
		);

		const currentElement = observerRef.current;

		if (currentElement) {
			observer.observe(currentElement);
		}

		return () => {
			observer.disconnect();
		};
	}, [enabled]);

	const renderItem = useCallback(
		(item: ItemValue, index: number) => propsRenderItem(item, index, items),
		[items, propsRenderItem]
	);

	return (
		<List
			{...listProps}
			loading={isLoading}
			dataSource={items}
			renderItem={renderItem}
			className={cx("css-var-r1 ant-select-css-var", className)}
			loadMore={
				<>
					{isFetching &&
						(loadMore || (
							<div className={cx(styles.loadingMoreWrapper)}>
								<Spin />
							</div>
						))}

					<div className="test-infinite-scroll" ref={observerRef}></div>
				</>
			}
		/>
	);
};

export default memo(ListWithInfiniteScroll) as typeof ListWithInfiniteScroll;

