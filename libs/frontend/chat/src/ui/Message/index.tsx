import React, { memo, useEffect, useMemo, useRef } from "react";

import { PushpinOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Tooltip, Typography } from "antd";

import { useStyles } from "./styles";

import { useChatStore } from "../../store";
import { UserInfo } from "../../types";
import { getPlaceholderAvatarUrl } from "../../utils";
import { generateListItemDataAttributes } from "../../utils/listItemDataAttributes";

export interface MessageProps {
	id: string;
	text: string;
	index: number;
	createdAt: string;
	senderName: string;
	showUserInfo: boolean;
	sentByCurrentUser: boolean;

	pinnedBy?: UserInfo | null;
	avatarUrl?: string | null;
	updatedAt?: string | null;

	onSenderClick?: (id: string) => void;
}

const Message: React.FC<MessageProps> = ({
	id,
	index,
	pinnedBy,
	createdAt,
	sentByCurrentUser,
	text,
	onSenderClick: onUserClick,
	senderName,
	avatarUrl,
	showUserInfo,
	updatedAt
}) => {
	const inputValue = useRef(text);

	const createdAtFormattedDates = useMemo(() => {
		const date = new Date(createdAt);

		return {
			short: date.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" }),
			full: date.toLocaleString(undefined, {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				day: "2-digit",
				month: "short",
				year: "numeric"
			})
		};
	}, [createdAt]);

	const updatedAtFormattedDate = useMemo(() => {
		if (!updatedAt) {
			return;
		}

		const date = new Date(updatedAt);

		return date.toLocaleString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
	}, [updatedAt]);

	const { ctxMenuIdx, editingItemIdx, clearEditingItemInfo, editSubmitHandler } = useChatStore();

	const handleSenderClick = useMemo(
		() =>
			onUserClick && !sentByCurrentUser
				? (e?: React.MouseEvent<HTMLElement>) => {
						e?.stopPropagation();
						onUserClick(id);
					}
				: undefined,
		[id, onUserClick, sentByCurrentUser]
	);

	const { styles, cx } = useStyles({
		senderClickable: !!handleSenderClick,
		showUserInfo,
		contextMenuOpened: ctxMenuIdx === index
	});

	const editing = editingItemIdx === index && !!editSubmitHandler;

	useEffect(() => {
		inputValue.current = text;
	}, [text]);

	return (
		<Flex
			className={styles.wrapper}
			gap="var(--ant-padding-xs)"
			{...generateListItemDataAttributes(index)}
		>
			<div className={styles.leftContentContainer}>
				{showUserInfo ? (
					<Avatar
						className={styles.avatar}
						size="small"
						src={
							showUserInfo
								? (avatarUrl ?? getPlaceholderAvatarUrl(senderName))
								: undefined
						}
					/>
				) : (
					<Tooltip title={createdAtFormattedDates.full}>
						<Typography.Text type="secondary" className={styles.date}>
							{createdAtFormattedDates.short}
						</Typography.Text>
					</Tooltip>
				)}
			</div>

			<div className={styles.body}>
				{pinnedBy && (
					<Typography.Text type="secondary" className={styles.secondaryText}>
						<PushpinOutlined style={{ fontSize: 10 }} /> Pinned by{" "}
						{onUserClick ? (
							<Button type="link" onClick={() => onUserClick(pinnedBy.id)}>
								{pinnedBy.username}
							</Button>
						) : (
							pinnedBy.username
						)}
					</Typography.Text>
				)}

				{showUserInfo && (
					<Flex gap="var(--ant-padding-xxs)" align="center">
						<Typography.Text className={styles.senderName} onClick={handleSenderClick}>
							{senderName}
						</Typography.Text>

						<Tooltip title={createdAtFormattedDates.full}>
							<Typography.Text type="secondary" className={styles.secondaryText}>
								{createdAtFormattedDates.short}
							</Typography.Text>
						</Tooltip>
					</Flex>
				)}

				<Typography.Paragraph
					editable={{
						editing,
						enterIcon: null,
						icon: null,
						triggerType: ["text"],
						onCancel: clearEditingItemInfo,
						onChange: value => (inputValue.current = value),
						onEnd: () => editSubmitHandler?.(inputValue.current)
					}}
					className={styles.text}
				>
					{editing ? (
						inputValue.current
					) : (
						<>
							{text}

							{updatedAt && (
								<Typography.Text
									type="secondary"
									className={cx(styles.secondaryText, styles.editedText)}
								>
									<Tooltip title={updatedAtFormattedDate}>(edited)</Tooltip>
								</Typography.Text>
							)}
						</>
					)}
				</Typography.Paragraph>

				{editing && (
					<Flex
						gap="var(--ant-padding-xs)"
						justify="flex-end"
						className={styles.editButtons}
					>
						<Button
							type="primary"
							size="small"
							onClick={() => editSubmitHandler?.(inputValue.current)}
						>
							Save
						</Button>

						<Button type="default" size="small" onClick={clearEditingItemInfo}>
							Cancel
						</Button>
					</Flex>
				)}
			</div>
		</Flex>
	);
};

export default memo(Message);

