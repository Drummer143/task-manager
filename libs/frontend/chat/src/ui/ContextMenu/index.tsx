import React, { memo, useCallback, useRef, useState } from "react";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Dropdown, MenuProps } from "antd";

import { useStyles } from "./styles";

import { useChatStore } from "../../store";
import { MessageListItem } from "../../types";
import {
	getClosestInteractiveListItem,
	getDataAttribute
} from "../../utils/listItemDataAttributes";

interface ContextMenuProps {
	children: React.ReactNode;
	listItems: MessageListItem[];
	currentUserId: string;

	handleDeleteMessage?: (id: string) => void;
	handleUpdateMessage?: (id: string, text: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
	children,
	listItems,
	currentUserId,
	handleDeleteMessage,
	handleUpdateMessage
}) => {
	const [ctxOpen, setCtxOpen] = useState(false);
	const [contextMenuItems, setContextMenuItems] = useState<MenuProps | undefined>(undefined);

	const ctxParams = useRef<MenuProps | undefined>(undefined);

	const { setSelectedItems, setEditingItemInfo, clearEditingItemInfo } = useChatStore();

	const styles = useStyles().styles;

	const closeContextMenu = useCallback(() => {
		setContextMenuItems(undefined);
		setCtxOpen(false);
		ctxParams.current = undefined;
		setSelectedItems(undefined);
	}, [setSelectedItems]);

	const handleContextMenuOpen = useCallback<React.MouseEventHandler<HTMLDivElement>>(
		e => {
			const ctxTarget = getClosestInteractiveListItem(e.target as Element | null | undefined);

			if (!ctxTarget || !getDataAttribute(ctxTarget, "data-interactive")) {
				e.preventDefault();
				e.stopPropagation();
				closeContextMenu();

				return;
			}

			const index = getDataAttribute(ctxTarget, "data-item-idx");
			const item = listItems[index];

			if (!item || item?.type !== "message") {
				e.preventDefault();
				e.stopPropagation();
				closeContextMenu();

				return;
			}

			const ctxMenu: NonNullable<MenuProps["items"]> = [];

			if (item.message.sender.id === currentUserId) {
				if (handleUpdateMessage) {
					ctxMenu.push({
						key: "edit",
						label: "Edit",
						icon: <EditOutlined />,
						onClick: () =>
							setEditingItemInfo(index, text => {
								handleUpdateMessage(item.message.id, text);
								clearEditingItemInfo();
							}),
						dashed: true
					});
				}

				if (handleDeleteMessage) {
					if (handleUpdateMessage) {
						ctxMenu.push({
							key: "div-1",
							type: "divider"
						});
					}

					ctxMenu.push({
						key: "delete",
						label: "Delete",
						icon: <DeleteOutlined />,
						danger: true,
						onClick: () => handleDeleteMessage(item.message.id)
					});
				}
			}

			setSelectedItems([item.id]);

			if (ctxMenu.length) {
				ctxParams.current = {
					items: ctxMenu
				};
				setContextMenuItems(ctxParams.current);
			} else {
				closeContextMenu();
			}
		},
		[
			listItems,
			currentUserId,
			setSelectedItems,
			closeContextMenu,
			handleUpdateMessage,
			handleDeleteMessage,
			setEditingItemInfo,
			clearEditingItemInfo
		]
	);

	const handleContextMenuClose = useCallback(
		(open: boolean) => {
			if (ctxParams.current) {
				setCtxOpen(open);
			}

			if (!open) {
				setContextMenuItems(undefined);
				setSelectedItems(undefined);
			}
		},
		[setContextMenuItems, setSelectedItems]
	);

	return (
		<Dropdown
			menu={contextMenuItems}
			trigger={["contextMenu"]}
			open={ctxOpen && !!contextMenuItems}
			onOpenChange={handleContextMenuClose}
		>
			<div
				onContextMenuCapture={handleContextMenuOpen}
				style={{ transform: "scaleY(-1)" }}
				className={styles.contextMenuWrapper}
			>
				{children}
			</div>
		</Dropdown>
	);
};

export default memo(ContextMenu);

