import React, { memo, useCallback, useRef, useState } from "react";

import { DeleteOutlined, EditOutlined, PushpinOutlined } from "@ant-design/icons";
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

	handlePinMessage?: (id: string) => void;
	handleDeleteMessage?: (id: string) => void;
	handleUpdateMessage?: (id: string, text: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
	children,
	listItems,
	currentUserId,
	handlePinMessage,
	handleDeleteMessage,
	handleUpdateMessage
}) => {
	const [contextMenuItems, setContextMenuItems] = useState<MenuProps | undefined>(undefined);

	const ctxParams = useRef<MenuProps | undefined>(undefined);

	const { setCtxMenuId, setEditingItemId, clearEditingItemInfo, setCtxOpen, ctxOpen } =
		useChatStore();

	const styles = useStyles().styles;

	const closeContextMenu = useCallback(() => {
		setContextMenuItems(undefined);
		setCtxOpen(false);
		ctxParams.current = undefined;
		setCtxMenuId(undefined);
	}, [setCtxMenuId, setCtxOpen]);

	const handleContextMenuOpen = useCallback<React.MouseEventHandler<HTMLDivElement>>(
		e => {
			const ctxTarget = getClosestInteractiveListItem(e.target as Element | null | undefined);

			if (!ctxTarget || !getDataAttribute(ctxTarget, "data-interactive")) {
				e.preventDefault();
				e.stopPropagation();
				closeContextMenu();

				return;
			}

			const id = getDataAttribute(ctxTarget, "data-item-id");
			const index = listItems.findIndex(item => item.id === id);
			const item = listItems.at(index);

			if (!item || item?.type !== "message") {
				e.preventDefault();
				e.stopPropagation();
				closeContextMenu();

				return;
			}

			const ctxMenu: NonNullable<MenuProps["items"]> = [];

			if (handlePinMessage) {
				ctxMenu.push({
					key: "pin",
					label: item.message.pinnedBy ? "Unpin" : "Pin",
					icon: <PushpinOutlined />,
					onClick: () => handlePinMessage(item.message.id)
				});
			}

			if (item.message.sender.id === currentUserId) {
				if (handleUpdateMessage) {
					ctxMenu.push({
						key: "edit",
						label: "Edit",
						icon: <EditOutlined />,
						onClick: () =>
							setEditingItemId(item.message.id, text => {
								handleUpdateMessage(item.message.id, text);
								clearEditingItemInfo();
							})
					});
				}

				if (handleDeleteMessage) {
					if (ctxMenu.length) {
						ctxMenu.push({
							key: "div-2",
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

			setCtxMenuId(item.message.id);

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
			handlePinMessage,
			currentUserId,
			setCtxMenuId,
			closeContextMenu,
			handleUpdateMessage,
			handleDeleteMessage,
			setEditingItemId,
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
				setCtxMenuId(undefined);
			}
		},
		[setCtxOpen, setCtxMenuId]
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
				className={styles.contextMenuWrapper}
			>
				{children}
			</div>
		</Dropdown>
	);
};

export default memo(ContextMenu);

