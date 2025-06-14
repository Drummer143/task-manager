import React, { memo, useCallback, useEffect, useRef } from "react";

import { ResponseWithPagination } from "@task-manager/api";
import { useDisclosure } from "@task-manager/react-utils";
import { Popover, PopoverProps } from "antd";

import { useStyles } from "./styles";

import ListWithInfiniteScroll, { ListWithInfiniteScrollProps } from "../ListWithInfiniteScroll";

interface PopoverInfiniteSelectProps<
	ItemValue,
	Response extends ResponseWithPagination<ItemValue>
	// Mode extends "single" | "multiple" = "single"
> extends Omit<PopoverProps, "content" | "children">,
		Pick<
			ListWithInfiniteScrollProps<ItemValue, Response>,
			"queryKey" | "fetchItems" | "extraParams" | "renderItem"
		> {
	// mode: Mode;
	children: React.ReactNode;

	getItemValue: (item: ItemValue) => unknown;

	value?: /* Mode extends "multiple" ? ItemValue[] : */ ItemValue;

	onChange?: (value: /* Mode extends "multiple" ? ItemValue[] : */ ItemValue) => void;
}

const PopoverInfiniteSelect = <
	ItemValue,
	Response extends ResponseWithPagination<ItemValue>
	// Mode extends "single" | "multiple" = "single"
>({
	children,
	fetchItems,
	renderItem: propsRenderItem,
	// mode,
	queryKey,
	value,
	onChange,
	extraParams,
	getItemValue,
	...popoverProps
}: PopoverInfiniteSelectProps<ItemValue, Response /* , Mode */>) => {
	const { open, onClose, setOpen } = useDisclosure();

	const { itemWrapper, popoverOverlay } = useStyles({ selected: !!value }).styles;

	const valueRef = useRef(value);

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
		(item: ItemValue, index: number, array: ItemValue[]) => {
			const isSelected =
				!!valueRef.current && getItemValue(valueRef.current) === getItemValue(item);
			const renderedItem = propsRenderItem(item, index, array);

			return (
				<div
					key={index}
					className={itemWrapper}
					onClick={isSelected ? onClose : () => handleSelectItem(item)}
				>
					{renderedItem}
				</div>
			);
		},
		[getItemValue, handleSelectItem, itemWrapper, onClose, propsRenderItem]
	);

	useEffect(() => {
		valueRef.current = value;
	}, [value]);

	return (
		<Popover
			{...popoverProps}
			open={open}
			onOpenChange={setOpen}
			classNames={{ root: popoverOverlay }}
			content={
				<ListWithInfiniteScroll
					queryKey={queryKey}
					fetchItems={fetchItems}
					extraParams={extraParams}
					renderItem={renderItem}
				/>
			}
		>
			{children}
		</Popover>
	);
};

export default memo(PopoverInfiniteSelect) as typeof PopoverInfiniteSelect;
