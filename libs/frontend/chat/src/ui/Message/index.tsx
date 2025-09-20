import React, { memo, useMemo } from "react";

import { Avatar, Flex, Typography } from "antd";

import { useStyles } from "./styles";

import { getPlaceholderAvatarUrl } from "../../utils";

export interface MessageProps {
	id: string;
	text: string;
	createdAt: string;
	senderName: string;
	sentByCurrentUser: boolean;

	selected?: boolean;
	avatarUrl?: string | null;
	showUserInfo: boolean;

	onSenderClick?: (id: string) => void;
}

const Message: React.FC<MessageProps> = ({
	id,
	createdAt,
	sentByCurrentUser,
	text,
	onSenderClick,
	senderName,
	avatarUrl,
	selected,
	showUserInfo
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
						onSenderClick(id);
					}
				: undefined,
		[id, onSenderClick, sentByCurrentUser]
	);

	const { styles } = useStyles({
		sentByCurrentUser,
		senderClickable: !!handleSenderClick,
		showUserInfo,
		selected
	});

	return (
		<Flex className={styles.wrapper} gap="var(--ant-padding-xs)">
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
					<Typography.Text type="secondary" className={styles.date}>
						{formattedDate}
					</Typography.Text>
				)}
			</div>

			<div>
				{showUserInfo && (
					<Typography.Text
						type="secondary"
						// className={styles.senderName}
						onClick={handleSenderClick}
					>
						{senderName}
					</Typography.Text>
				)}

				<Typography.Paragraph className={styles.messageBody}>{text}</Typography.Paragraph>
			</div>
		</Flex>
	);
};

export default memo(Message);

