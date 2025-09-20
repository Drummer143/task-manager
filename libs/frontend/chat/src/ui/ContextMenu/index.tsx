import React, { memo, useCallback, useRef, useState } from "react";

import { DeleteOutlined } from "@ant-design/icons";
import { Dropdown, MenuProps } from "antd";

import { useStyles } from "./styles";

import { MessageListItem } from "../../types";

interface ContextMenuProps {
	children: React.ReactNode;
	listItems: MessageListItem[];
	currentUserId: string;

	handleDeleteMessage?: (id: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
	children,
	listItems,
	currentUserId,
	handleDeleteMessage
}) => {
	const [ctxOpen, setCtxOpen] = useState(false);
	const [contextMenuItems, setContextMenuItems] = useState<MenuProps | undefined>(undefined);

	const ctxParams = useRef<MenuProps | undefined>(undefined);

	const styles = useStyles().styles;

	const closeContextMenu = useCallback(() => {
		setContextMenuItems(undefined);
		setCtxOpen(false);
		ctxParams.current = undefined;
	}, []);

	const handleContextMenuOpen = useCallback<React.MouseEventHandler<HTMLDivElement>>(
		e => {
			const ctxTarget = (e.target as HTMLElement | null)?.closest(
				'[data-contextmenu="true"]'
			);
			const index = Number(ctxTarget?.getAttribute("data-contextmenu-message-idx"));

			if (!ctxTarget || isNaN(index)) {
				e.preventDefault();
				e.stopPropagation();
				closeContextMenu();

				return;
			}

			const item = listItems[index];

			if (!item || item?.type !== "message") {
				e.preventDefault();
				e.stopPropagation();
				closeContextMenu();

				return;
			}

			const ctxMenu: NonNullable<MenuProps["items"]> = [];

			if (item.message.sender.id === currentUserId && handleDeleteMessage) {
				ctxMenu.push({
					key: "delete",
					label: "Delete",
					icon: <DeleteOutlined />,
					danger: true,
					onClick: () => handleDeleteMessage(item.message.id)
				});
			}

			if (ctxMenu.length) {
				ctxParams.current = {
					items: ctxMenu
				};
				setContextMenuItems(ctxParams.current);
			} else {
				closeContextMenu();
			}
		},
		[listItems, currentUserId, handleDeleteMessage, closeContextMenu, setContextMenuItems]
	);

	const handleContextMenuClose = useCallback(
		(open: boolean) => {
			if (ctxParams.current) {
				setCtxOpen(open);
			}

			if (!open) {
				setContextMenuItems(undefined);
			}
		},
		[setContextMenuItems]
	);

	return (
		<Dropdown
			menu={contextMenuItems}
			trigger={["contextMenu"]}
			open={ctxOpen && !!contextMenuItems}
			onOpenChange={handleContextMenuClose}
		>
			<div onContextMenuCapture={handleContextMenuOpen} className={styles.contextMenuWrapper}>
				{children}
			</div>
		</Dropdown>
	);
};

export default memo(ContextMenu);

