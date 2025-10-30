/* eslint-disable max-lines */
import React, { memo, useEffect, useMemo, useRef } from "react";

import { EnterOutlined, PushpinOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Tooltip, Typography } from "antd";
import { motion } from "framer-motion";
import { useSnapshot } from "valtio";

import { useStyles } from "./styles";

import { chatStore } from "../../state";
import { MessageData, UserInfo } from "../../types";
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
	replyTo?: Pick<MessageData, "id" | "text" | "sender"> | null;

	onSenderClick?: (id: string) => void;
}

const messageVariants = {
	initial: {
		"--highlight-opacity": 0
	},
	highlighted: {
		"--highlight-opacity": 0.2
	}
};

const Message: React.FC<MessageProps> = ({
	id,
	pinnedBy,
	createdAt,
	sentByCurrentUser,
	text,
	onSenderClick: onUserClick,
	senderName,
	avatarUrl,
	showUserInfo,
	updatedAt,
	replyTo
}) => {
	const chatStoreSnapshot = useSnapshot(chatStore);
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
		contextMenuOpened: chatStore.ctxItemId === id
	});

	const editing = chatStoreSnapshot.edit?.messageId === id;
	const highlighted = chatStoreSnapshot.highlightedItemId === id;

	useEffect(() => {
		inputValue.current = text;
	}, [text]);

	useEffect(() => {
		if (highlighted) {
			chatStore.highlightedViewed = true;
		}
	}, [highlighted]);

	return (
		<motion.div
			className={styles.wrapper}
			initial={highlighted && chatStore.highlightedViewed ? "highlighted" : "initial"}
			animate={highlighted ? "highlighted" : "initial"}
			variants={messageVariants}
			transition={{ duration: 0.5, ease: "easeOut" }}
			{...generateListItemDataAttributes(id)}
		>
			<div className={styles.actionButtons}>
				<Button
					type="text"
					size="small"
					icon={<EnterOutlined style={{ transform: "scaleY(-1)" }} />}
					onClick={() => (chatStore.replayMessage = { id, text, senderName })}
				/>
			</div>

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
					<Typography.Paragraph type="secondary" className={styles.secondaryText}>
						<PushpinOutlined style={{ fontSize: 10 }} /> Pinned by{" "}
						{onUserClick ? (
							<Button type="link" onClick={() => onUserClick(pinnedBy.id)}>
								{pinnedBy.username}
							</Button>
						) : (
							pinnedBy.username
						)}
					</Typography.Paragraph>
				)}

				{replyTo && (
					<Typography.Paragraph
						type="secondary"
						onClick={() => (chatStore.scrollToItemId = replyTo.id)}
						ellipsis
						style={{ cursor: "pointer" }}
						className={styles.secondaryText}
					>
						<EnterOutlined style={{ fontSize: 10, transform: "scaleY(-1)" }} /> Reply to{" "}
						{onUserClick ? (
							<Button type="link" onClick={() => onUserClick(replyTo.sender.id)}>
								{replyTo.sender.username}
							</Button>
						) : (
							replyTo.sender.username
						)}
						: {replyTo.text}
					</Typography.Paragraph>
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
						onCancel: () => (chatStore.edit = undefined),
						onChange: value => (inputValue.current = value),
						onEnd: () => (chatStore.edit!.text = inputValue.current)
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
							onClick={() => (chatStore.edit!.text = inputValue.current)}
						>
							Save
						</Button>

						<Button
							type="default"
							size="small"
							onClick={() => (chatStore.edit = undefined)}
						>
							Cancel
						</Button>
					</Flex>
				)}
			</div>
		</motion.div>
	);
};

export default memo(Message);

