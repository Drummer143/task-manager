import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { PaginationQuery, ResponseWithPagination } from "@task-manager/api";
import { useDebouncedEffect } from "@task-manager/react-utils";
import { GetProp, GetRef, Select, Spin, Tooltip } from "antd";
import { DefaultOptionType, SelectProps } from "antd/es/select";

interface SelectWithInfiniteScrollProps<
	ItemType,
	Response extends ResponseWithPagination<ItemType>,
	ExtraQuery extends object
> extends Omit<
		SelectProps,
		| "options"
		| "onPopupScroll"
		| "onSearch"
		| "loading"
		| "filterOption"
		| "dropdownRender"
		| "maxTagPlaceholder"
		| "optionRender"
	> {
	fetchItems: (query?: PaginationQuery<ExtraQuery>) => Promise<Response>;
	transformItem: (item: Response["data"][number]) => DefaultOptionType;
	optionRender?: (
		item: Response["data"][number],
		...args: Parameters<GetProp<SelectProps, "optionRender">>
	) => React.ReactNode;

	queryKey: QueryKey;
	filterQueryName?: string;
	extraQueryParams?: ExtraQuery;
	/** if equals to "withTooltip" then tag will open tooltip on hover */
	maxTagPlaceholder?:
		| "withTooltip"
		| React.ReactNode
		| ((
				omittedValues: {
					key?: React.Key;
					value?: string | number;
					label?: React.ReactNode;
					title?: React.ReactNode;
					disabled?: boolean;
				}[]
		  ) => React.ReactNode);
}

const SelectWithInfiniteScroll = <
	ItemType,
	Response extends ResponseWithPagination<ItemType>,
	ExtraQuery extends object
>({
	fetchItems,
	transformItem,
	onFocus,
	onBlur,
	queryKey,
	maxTagPlaceholder: propsMaxTagPlaceholder,
	extraQueryParams,
	filterQueryName,
	optionRender: propsOptionRender,
	...props
}: SelectWithInfiniteScrollProps<ItemType, Response, ExtraQuery>) => {
	const [searchText, setSearchText] = useState("");
	const [debouncedSearchText, setDebouncedSearchText] = useState("");

	const extraParams = useMemo<ExtraQuery>(() => {
		return {
			...extraQueryParams,
			...(filterQueryName ? { [filterQueryName]: debouncedSearchText } : {})
		} as ExtraQuery;
	}, [debouncedSearchText, extraQueryParams, filterQueryName]);

	const selectRef = useRef<GetRef<typeof Select> | null>(null);

	const { data, isFetching, isLoading, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery<
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

	const { items, optionRender } = useMemo<{
		items: DefaultOptionType[];
		optionRender?: GetProp<SelectProps, "optionRender">;
	}>(() => {
		const items = data?.pages.flatMap(page => page.data) || [];

		return {
			items: items.map(transformItem),
			optionRender: propsOptionRender
				? (option, info) => propsOptionRender(items[info.index], option, info)
				: undefined
		};
	}, [data?.pages, propsOptionRender, transformItem]);

	const maxTagPlaceHolder: SelectProps["maxTagPlaceholder"] = useMemo(() => {
		if (!propsMaxTagPlaceholder || propsMaxTagPlaceholder !== "withTooltip") {
			return propsMaxTagPlaceholder;
		}

		return omittedValues => (
			<span onClick={e => e.stopPropagation()}>
				<Tooltip
					style={{ userSelect: "all" }}
					title={omittedValues.map(item => item.label).join(", ")}
				>
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

	useDebouncedEffect(searchText, setDebouncedSearchText, 500);

	useEffect(() => {
		refetch({ cancelRefetch: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [extraParams]);

	useEffect(() => {
		const ref = selectRef.current;

		return () => {
			ref?.scrollTo(0);
		};
	}, [extraQueryParams]);

	return (
		<Select
			showSearch
			{...props}
			options={items}
			onFocus={onFocus}
			onBlur={onBlur}
			onPopupScroll={handleScroll}
			onSearch={setSearchText}
			searchValue={searchText}
			loading={isLoading}
			optionRender={optionRender}
			ref={selectRef}
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

