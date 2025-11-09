import React, { memo, useCallback, useRef, useState } from "react";

import { DeleteOutlined, EditOutlined, PushpinOutlined } from "@ant-design/icons";
import { Dropdown, MenuProps } from "antd";
import { useSnapshot } from "valtio";

import { useStyles } from "./styles";

import { chatStore } from "../../state";
import {
	getClosestInteractiveListItem,
	getDataAttribute
} from "../../utils/listItemDataAttributes";

interface ContextMenuProps {
	children: React.ReactNode;
	currentUserId: string;

	handlePinMessage?: (id: string) => void;
	handleDeleteMessage?: (id: string) => void;
	handleUpdateMessage?: (id: string, text: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
	children,
	currentUserId,
	handlePinMessage,
	handleDeleteMessage,
	handleUpdateMessage
}) => {
	const chatStoreSnapshot = useSnapshot(chatStore);

	const [contextMenuItems, setContextMenuItems] = useState<MenuProps | undefined>(undefined);

	const ctxParams = useRef<MenuProps | undefined>(undefined);

	const styles = useStyles().styles;

	const closeContextMenu = useCallback(() => {
		setContextMenuItems(undefined);
		chatStore.ctxOpen = false;
		ctxParams.current = undefined;
		chatStore.ctxItemId = undefined;
	}, []);

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
			const item = chatStore.listInfo.items.find(item => item.id === id);

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
							(chatStore.edit = {
								messageId: item.message.id
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

			chatStore.ctxItemId = item.message.id;

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
			handlePinMessage,
			currentUserId,
			closeContextMenu,
			handleUpdateMessage,
			handleDeleteMessage
		]
	);

	const handleContextMenuClose = useCallback((open: boolean) => {
		if (ctxParams.current) {
			chatStore.ctxOpen = open;
		}

		if (!open) {
			setContextMenuItems(undefined);
			chatStore.ctxItemId = undefined;
		}
	}, []);

	return (
		<Dropdown
			menu={contextMenuItems}
			trigger={["contextMenu"]}
			open={chatStoreSnapshot.ctxOpen && !!contextMenuItems}
			onOpenChange={handleContextMenuClose}
		>
			<div onContextMenuCapture={handleContextMenuOpen} className={styles.contextMenuWrapper}>
				{children}
			</div>
		</Dropdown>
	);
};

export default memo(ContextMenu);

