import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { useDebouncedEffect } from "@task-manager/utils";
import { Select, Spin, Tooltip } from "antd";
import { DefaultOptionType, SelectProps } from "antd/es/select";
import { BaseSelectRef } from "rc-select";
import { DisplayValueType } from "rc-select/lib/interface";

interface SelectWithInfiniteScrollProps<L, T extends ResponseWithPagination<L>, Q extends object = never>
	extends Omit<
		SelectProps,
		"options" | "onPopupScroll" | "onSearch" | "loading" | "filterOption" | "dropdownRender" | "maxTagPlaceholder"
	> {
	fetchItems: (query?: PaginationQuery<Q>) => Promise<T>;
	transformItem: (item: T["data"][number]) => DefaultOptionType;

	queryKey: QueryKey;
	filterQueryName?: string;
	extraQueryParams?: Record<string, string>;
	/** if equals to "withTooltip" then tag will open tooltip on hover */
	maxTagPlaceholder?: "withTooltip" | React.ReactNode | ((omittedValues: DisplayValueType[]) => React.ReactNode);
}

const SelectWithInfiniteScroll = <L, T extends ResponseWithPagination<L>, Q extends object = never>({
	fetchItems,
	transformItem,
	onFocus,
	onBlur,
	queryKey,
	maxTagPlaceholder: propsMaxTagPlaceholder,
	extraQueryParams,
	filterQueryName,
	...props
}: SelectWithInfiniteScrollProps<L, T, Q>) => {
	const [items, setItems] = useState<DefaultOptionType[]>([]);
	const [searchText, setSearchText] = useState("");
	const [debouncedSearchText, setDebouncedSearchText] = useState("");

	const extraParams = useMemo(
		() => ({
			...extraQueryParams,
			...(filterQueryName ? { [filterQueryName]: debouncedSearchText } : {})
		}),
		[debouncedSearchText, extraQueryParams, filterQueryName]
	);

	const selectRef = useRef<BaseSelectRef | null>(null);

	const { data, isFetching, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery<
		T,
		Error,
		InfiniteData<T, number>,
		QueryKey,
		number
	>({
		queryKey,
		queryFn: ({ pageParam }) => fetchItems({ ...extraParams, offset: pageParam, limit: 10 }),
		getNextPageParam: lastPage => (lastPage.meta.hasMore ? lastPage.meta.offset + lastPage.meta.limit : undefined),
		initialPageParam: 0,
		initialData: {
			pageParams: [0],
			pages: [{ data: [], meta: { total: 0, limit: 10, offset: 0, hasMore: true } } as unknown as T]
		}
	});

	const maxTagPlaceHolder: SelectProps["maxTagPlaceholder"] = useMemo(() => {
		if (!propsMaxTagPlaceholder || propsMaxTagPlaceholder !== "withTooltip") {
			return propsMaxTagPlaceholder;
		}

		 
		return omittedValues => (
			<span onClick={e => e.stopPropagation()}>
				<Tooltip style={{ userSelect: "all" }} title={omittedValues.map(item => item.label).join(", ")}>
					+{omittedValues.length}...
				</Tooltip>
			</span>
		);
	}, [propsMaxTagPlaceholder]);

	const handleScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
		event => {
			const target = event.target as HTMLDivElement;

			if (hasNextPage && target.scrollTop + target.offsetHeight === target.scrollHeight) {
				fetchNextPage();
			}
		},
		[fetchNextPage, hasNextPage]
	);

	useDebouncedEffect(
		searchText,
		name => {
			setDebouncedSearchText(name);
			setItems([]);
		},
		500
	);

	useEffect(() => {
		if (!data) {
			return;
		}

		setItems(prevItems => prevItems.concat(data.pages.at(-1)?.data.map(transformItem) || []));
		 
	}, [data]);

	useEffect(() => {
		const ref = selectRef.current;

		return () => {
			ref?.scrollTo(0);
			setItems([]);
		};
	}, [extraQueryParams]);

	return (
		<Select
			{...props}
			options={items}
			onFocus={onFocus}
			onBlur={onBlur}
			onPopupScroll={handleScroll}
			onSearch={setSearchText}
			searchValue={searchText}
			loading={isLoading}
			ref={selectRef}
			showSearch
			filterOption={false}
			maxTagPlaceholder={maxTagPlaceHolder}
			virtual={items.length > 100 ? true : undefined}
			notFoundContent={
				isFetching ? (
					<div style={{ textAlign: "center", padding: "10px" }}>
						<Spin />
					</div>
				) : undefined
			}
		/>
	);
};

export default memo(SelectWithInfiniteScroll) as typeof SelectWithInfiniteScroll;
