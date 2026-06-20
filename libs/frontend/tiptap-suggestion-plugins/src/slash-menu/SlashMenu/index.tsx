import React, { useEffect, useImperativeHandle, useRef, useState } from "react";

import { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import { Button } from "antd";

import { useStyles } from "./styles";

export type SlashMenuItem = {
	key: string;
	title: string;
	icon?: React.ReactNode;
	onClick: (props: Omit<SuggestionProps, "items">) => void;
};

export type SlashMenuGroup = {
	title: string;
	items: SlashMenuItem[];
};

export type SlashMenuRef = {
	onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};

interface SlashMenuProps extends Omit<SuggestionProps, "items"> {
	items: SlashMenuGroup[];

	ref?: React.Ref<SlashMenuRef>;
}

const SlashMenu: React.FC<SlashMenuProps> = ({ ref, items, ...props }) => {
	const { styles, cx } = useStyles();
	const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
	const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

	const selectedGroupRef = useRef(0);
	const selectedCommandRef = useRef(0);

	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		selectedGroupRef.current = 0;
		selectedCommandRef.current = 0;
		setSelectedGroupIndex(0);
		setSelectedCommandIndex(0);
	}, [items]);

	const selectItem = (groupIndex: number, commandIndex: number) => {
		items[groupIndex]?.items[commandIndex]?.onClick(props);
	};

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (event.key === "ArrowDown") {
				if (!items.length) return false;

				const group = items[selectedGroupRef.current];
				let newCommandIndex = selectedCommandRef.current + 1;
				let newGroupIndex = selectedGroupRef.current;

				if (group.items.length - 1 < newCommandIndex) {
					newCommandIndex = 0;
					newGroupIndex = selectedGroupRef.current + 1;
				}
				if (items.length - 1 < newGroupIndex) {
					newGroupIndex = 0;
				}

				selectedGroupRef.current = newGroupIndex;
				selectedCommandRef.current = newCommandIndex;
				setSelectedGroupIndex(newGroupIndex);
				setSelectedCommandIndex(newCommandIndex);
				return true;
			}

			if (event.key === "ArrowUp") {
				if (!items.length) return false;

				let newCommandIndex = selectedCommandRef.current - 1;
				let newGroupIndex = selectedGroupRef.current;

				if (newCommandIndex < 0) {
					newGroupIndex = selectedGroupRef.current - 1;
					if (newGroupIndex < 0) {
						newGroupIndex = items.length - 1;
					}
					newCommandIndex = items[newGroupIndex].items.length - 1;
				}

				selectedGroupRef.current = newGroupIndex;
				selectedCommandRef.current = newCommandIndex;
				setSelectedGroupIndex(newGroupIndex);
				setSelectedCommandIndex(newCommandIndex);
				return true;
			}

			if (event.key === "Enter") {
				if (!items.length) return false;
				selectItem(selectedGroupRef.current, selectedCommandRef.current);
				return true;
			}

			return false;
		}
	}));

	useEffect(() => {
		if (scrollContainerRef.current) {
			const $el = scrollContainerRef.current.querySelector<HTMLElement>(
				`[data-option="group:${selectedGroupIndex}option:${selectedCommandIndex}"]`
			);

			$el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
	}, [selectedCommandIndex, selectedGroupIndex]);

	if (!items.length) return null;

	return (
		<div ref={scrollContainerRef} className={styles.container}>
			{items.map((group, groupIndex) => (
				<div key={group.title} className={styles.group}>
					<div className={styles.groupTitle}>{group.title}</div>
					<div className={styles.groupItems}>
						{group.items.map((item, commandIndex) => {
							const isSelected =
								groupIndex === selectedGroupIndex &&
								commandIndex === selectedCommandIndex;

							return (
								<Button
									block
									type="text"
									key={item.key}
									icon={item.icon}
									data-option={`group:${groupIndex}option:${commandIndex}`}
									onClick={() => selectItem(groupIndex, commandIndex)}
									onMouseEnter={() => {
										selectedGroupRef.current = groupIndex;
										selectedCommandRef.current = commandIndex;
										setSelectedGroupIndex(groupIndex);
										setSelectedCommandIndex(commandIndex);
									}}
									className={cx(
										styles.button,
										isSelected && styles.buttonSelected
									)}
								>
									{item.title}
								</Button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
};

export default SlashMenu;
