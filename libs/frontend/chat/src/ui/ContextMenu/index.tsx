import React, { memo, useCallback, useRef, useState } from "react";

import { DeleteOutlined } from "@ant-design/icons";
import { Dropdown, MenuProps } from "antd";

import { useStyles } from "./styles";

import { MessageListItem } from "../../types";

interface ContextMenuProps {
	children: React.ReactNode;
	listItems: MessageListItem[];
	currentUserId: string;
	contextMenuParams: { idx: number; menu: MenuProps } | undefined;

	handleDeleteMessage?: (id: string) => void;

	setContextMenuParams: React.Dispatch<
		React.SetStateAction<{ idx: number; menu: MenuProps } | undefined>
	>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
	children,
	setContextMenuParams,
	listItems,
	currentUserId,
	handleDeleteMessage,
	contextMenuParams
}) => {
	const [ctxOpen, setCtxOpen] = useState(false);

	const ctxParams = useRef<{ idx: number; menu: MenuProps } | undefined>(undefined);

	const styles = useStyles().styles;

	const closeContextMenu = useCallback(() => {
		setContextMenuParams(undefined);
		setCtxOpen(false);
		ctxParams.current = undefined;
	}, [setContextMenuParams]);

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
					idx: index,
					menu: {
						items: ctxMenu
					}
				};
				setContextMenuParams(ctxParams.current);
			} else {
				closeContextMenu();
			}
		},
		[listItems, currentUserId, handleDeleteMessage, closeContextMenu, setContextMenuParams]
	);

	const handleContextMenuClose = useCallback(
		(open: boolean) => {
			if (ctxParams.current) {
				setCtxOpen(open);
			}

			if (!open) {
				setContextMenuParams(undefined);
			}
		},
		[setContextMenuParams]
	);

	return (
		<Dropdown
			menu={contextMenuParams?.menu}
			trigger={["contextMenu"]}
			open={ctxOpen && !!contextMenuParams}
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

