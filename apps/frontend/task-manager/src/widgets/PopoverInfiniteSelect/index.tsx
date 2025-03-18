import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { useDisclosure } from "@task-manager/utils";
import { List, Popover, PopoverProps, Spin } from "antd";

import * as s from "./styles";
import "./styles.css";

interface PopoverInfiniteSelectProps<
	ItemValue,
	Response extends ResponseWithPagination<ItemValue>
	// Mode extends "single" | "multiple" = "single"
> extends Omit<PopoverProps, "content" | "children"> {
	// mode: Mode;
	children: React.ReactNode;
	queryKey: QueryKey;

	itemRender: (item: ItemValue, index: number) => React.ReactNode;
	fetchItems: (query?: PaginationQuery) => Promise<Response>;
	getItemValue: (item: ItemValue) => unknown;

	value?: /* Mode extends "multiple" ? ItemValue[] : */ ItemValue;
	extraParams?: Record<string, string | number | boolean | string | undefined | null>;

	onChange?: (value: /* Mode extends "multiple" ? ItemValue[] : */ ItemValue) => void;
}

const PopoverInfiniteSelect = <
	ItemValue,
	Response extends ResponseWithPagination<ItemValue>
	// Mode extends "single" | "multiple" = "single"
>({
	children,
	fetchItems,
	itemRender: propsItemRender,
	// mode,
	queryKey,
	value,
	onChange,
	extraParams,
	getItemValue,
	...popoverProps
}: PopoverInfiniteSelectProps<ItemValue, Response /* , Mode */>) => {
	const [items, setItems] = useState<ItemValue[]>([]);

	const { open, onClose, setOpen } = useDisclosure();

	const valueRef = useRef(value);

	const { data, isFetching, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery<
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
		initialData: {
			pageParams: [0],
			pages: [{ data: [], meta: { total: 0, limit: 10, offset: 0, hasMore: true } } as unknown as Response]
		}
	});

	const handleScroll: React.UIEventHandler<HTMLElement> = useCallback(
		event => {
			const target = event.target as HTMLDivElement;

			if (hasNextPage && target.scrollTop + target.offsetHeight > target.scrollHeight - 100) {
				fetchNextPage();
			}
		},
		[fetchNextPage, hasNextPage]
	);

	const handleSelectItem = useCallback(
		(item: ItemValue) => {
			if (onChange) {
				onChange(item);
				onClose();
			}
		},
		[onChange, onClose]
	);

	const renderItem = useCallback(
		(item: ItemValue, index: number) => {
			const isSelected = !!valueRef.current && getItemValue(valueRef.current) === getItemValue(item);
			const renderedItem = propsItemRender(item, index);

			return (
				<s.ItemWrapper selected={isSelected} onClick={isSelected ? onClose : () => handleSelectItem(item)}>
					{renderedItem}
				</s.ItemWrapper>
			);
		},
		[getItemValue, handleSelectItem, onClose, propsItemRender]
	);

	useEffect(() => {
		if (data) {
			setItems(data.pages.flatMap(page => page.data));
		}
	}, [data]);

	useEffect(() => {
		valueRef.current = value;
	}, [value]);

	return (
		<Popover
			{...popoverProps}
			open={open}
			onOpenChange={setOpen}
			overlayClassName="popover-overlay"
			content={
				<div onScroll={handleScroll}>
					<List
						className="css-var-r3 ant-select-css-var"
						loading={isLoading}
						dataSource={items}
						renderItem={renderItem}
						loadMore={
							isFetching && (
								<s.LoadingMoreWrapper>
									<Spin />
								</s.LoadingMoreWrapper>
							)
						}
					/>
				</div>
			}
		>
			{children}
		</Popover>
	);
};

export default memo(PopoverInfiniteSelect) as typeof PopoverInfiniteSelect;
