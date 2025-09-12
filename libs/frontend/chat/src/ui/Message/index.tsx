import React, { memo, useMemo } from "react";

import { Avatar, Flex, Typography } from "antd";

import { useStyles } from "./styles";

import { getPlaceholderAvatarUrl } from "../../utils";

export interface MessageProps {
	text: string;
	createdAt: string;
	senderName: string;
	sentByCurrentUser: boolean;

	last?: boolean;
	avatarUrl?: string;
	showAvatar?: boolean;
	paddingBottom?: "small" | "large";
	showSenderName?: boolean;

	onSenderClick?: () => void;
}

const Message: React.FC<MessageProps> = ({
	createdAt,
	sentByCurrentUser,
	text,
	onSenderClick,
	senderName,
	avatarUrl,
	paddingBottom = "small",
	last,
	showAvatar = true,
	showSenderName = true
}) => {
	const formattedDate = useMemo(
		() => new Date(createdAt).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" }),
		[createdAt]
	);

	const handleSenderClick = useMemo(
		() =>
			onSenderClick && !sentByCurrentUser
				? (e?: React.MouseEvent<HTMLElement>) => {
						e?.stopPropagation();
						onSenderClick();
					}
				: undefined,
		[onSenderClick, sentByCurrentUser]
	);

	const styles = useStyles({
		sentByCurrentUser,
		senderClickable: !!handleSenderClick,
		paddingBottom,
		last
	}).styles;

	return (
		<Flex
			className={styles.wrapper}
			align="flex-end"
			justify={sentByCurrentUser ? "flex-end" : undefined}
			gap="var(--ant-padding-xs)"
		>
			{!sentByCurrentUser &&
				(showAvatar ? (
					<Avatar
						size="small"
						className={styles.avatar}
						src={avatarUrl ?? getPlaceholderAvatarUrl(senderName)}
						onClick={handleSenderClick}
					/>
				) : (
					<div className={styles.avatarPlaceholder} />
				))}

			<div className={styles.messageBody}>
				{!sentByCurrentUser && showSenderName && (
					<Typography.Text
						type="secondary"
						className={styles.senderName}
						onClick={handleSenderClick}
					>
						{senderName}
					</Typography.Text>
				)}

				<Flex justify="space-between" wrap gap="var(--ant-padding-xs)">
					<Typography.Text>{text}</Typography.Text>

					<Typography.Text type="secondary" className={styles.date}>
						{formattedDate}
					</Typography.Text>
				</Flex>
			</div>
		</Flex>
	);
};

export default memo(Message);

