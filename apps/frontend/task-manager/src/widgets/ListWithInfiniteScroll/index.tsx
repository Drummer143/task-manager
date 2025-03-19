import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { PaginationQuery, ResponseWithPagination } from "@task-manager/api";
import { cn } from "@task-manager/utils";
import { List, ListProps, Spin } from "antd";

import * as s from "./styles";

export interface ListWithInfiniteScrollProps<
	ItemValue,
	Response extends ResponseWithPagination<ItemValue> = ResponseWithPagination<ItemValue>
> extends Omit<ListProps<ItemValue>, "loading" | "dataSource" | "renderItem"> {
	queryKey: QueryKey;
	enabled?: boolean;
	extraParams?: Record<string, string | number | boolean | string | undefined | null>;
	renderItem: (item: ItemValue, index: number, array: ItemValue[]) => React.ReactNode;
	fetchItems: (query?: PaginationQuery) => Promise<Response>;
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

	const { data, isFetching, isLoading, hasNextPage, fetchNextPage, promise } = useInfiniteQuery<
		Response,
		Error,
		InfiniteData<Response, number>,
		QueryKey,
		number
	>({
		queryKey,
		queryFn: ({ pageParam }) => fetchItems({ ...extraParams, offset: pageParam, limit: 10 }),
		getNextPageParam: lastPage => (lastPage.meta.hasMore ? lastPage.meta.offset + lastPage.meta.limit : undefined),
		initialPageParam: 0,
		enabled,
		initialData: {
			pageParams: [0],
			pages: [{ data: [], meta: { total: 0, limit: 10, offset: 0, hasMore: true } } as unknown as Response]
		}
	});

	const requestMetaRef = useRef({ hasNextPage, isFetching, isLoading, promise, fetchNextPage });

	useEffect(() => {
		if (data.pages?.[0]?.data?.[0]) {
			setItems(data.pages.flatMap(page => page.data));
		}
	}, [data]);

	useEffect(() => {
		requestMetaRef.current = { hasNextPage, isFetching, isLoading, promise, fetchNextPage };
	}, [fetchNextPage, hasNextPage, isFetching, isLoading, promise]);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				if (
					entries[0].isIntersecting &&
					requestMetaRef.current.hasNextPage &&
					!requestMetaRef.current.isFetching &&
					!requestMetaRef.current.isLoading
				) {
					requestMetaRef.current.fetchNextPage();
				} else if (requestMetaRef.current.isFetching || requestMetaRef.current.isLoading) {
					const interval = setInterval(() => {
						if (!requestMetaRef.current.isFetching && !requestMetaRef.current.isLoading) {
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
			if (currentElement) {
				observer.unobserve(currentElement);
			}
		};
	}, [enabled]);

	const renderItem = useCallback(
		(item: ItemValue, index: number) => propsRenderItem(item, index, items),
		[items, propsRenderItem]
	);

	return (
		<>
			<List
				{...listProps}
				loading={isLoading}
				dataSource={items}
				renderItem={renderItem}
				className={cn("css-var-r3 ant-select-css-var", className)}
				loadMore={
					isFetching &&
					(loadMore || (
						<s.LoadingMoreWrapper>
							<Spin />
						</s.LoadingMoreWrapper>
					))
				}
			/>

			<div className="test-infinite-scroll" ref={observerRef}></div>
		</>
	);
};

export default memo(ListWithInfiniteScroll) as typeof ListWithInfiniteScroll;
