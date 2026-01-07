import React, { memo, useEffect, useRef } from "react";

import { MenuItem, registerContextMenu } from "@task-manager/context-menu";

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
	const ctxRef = useRef<HTMLDivElement>(null);

	const styles = useStyles().styles;

	useEffect(() => {
		if (!ctxRef.current) {
			return;
		}

		return registerContextMenu({
			element: ctxRef.current,
			name: "chat",
			// stopPropagation: true,
			menu: e => {
				const ctxTarget = getClosestInteractiveListItem(
					e.target as Element | null | undefined
				);

				if (!ctxTarget || !getDataAttribute(ctxTarget, "data-interactive")) {
					return [];
				}

				const id = getDataAttribute(ctxTarget, "data-item-id");
				const item = chatStore.listInfo.items.find(item => item.id === id);

				if (!item || item?.type !== "message") {
					return [];
				}

				const ctxMenu: MenuItem[] = [];

				if (handlePinMessage) {
					ctxMenu.push({
						// key: "pin",
						title: item.message.pinnedBy ? "Unpin" : "Pin",
						// icon: <PushpinOutlined />,
						onClick: () => handlePinMessage(item.message.id)
					});
				}

				if (item.message.sender.id === currentUserId) {
					if (handleUpdateMessage) {
						ctxMenu.push({
							// key: "edit",
							title: "Edit",
							// icon: <EditOutlined />,
							onClick: () =>
								(chatStore.edit = {
									messageId: item.message.id
								})
						});
					}

					if (handleDeleteMessage) {
						ctxMenu.push({
							// key: "delete",
							title: "Delete",
							// icon: <DeleteOutlined />,
							danger: true,
							onClick: () => handleDeleteMessage(item.message.id)
						});
					}
				}

				return ctxMenu;
			}
		});
	}, [currentUserId, handleDeleteMessage, handlePinMessage, handleUpdateMessage]);

	return (
		<div className={styles.contextMenuWrapper} ref={ctxRef}>
			{children}
		</div>
	);
};

export default memo(ContextMenu);

