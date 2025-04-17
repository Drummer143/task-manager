import React, { memo } from "react";

import { Avatar } from "antd";
import { createStyles } from "antd-style";

interface UserMenuInfoProps {
	mobile?: boolean;
	picture?: string;
	username?: string;

	onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const useStyles = createStyles(({ css }, { mobile }: { mobile?: boolean }) => ({
	wrapper: css`
		height: fit-content;

		padding: var(--ant-padding-xs) 0;

		display: flex;
		gap: var(--ant-margin-sm);
		align-items: center;

		cursor: pointer;

		${mobile &&
		css`
			width: fit-content;

			margin: 0 auto;
		`}

		p {
			margin: 0;
		}
	`
}));

const UserMenuInfo: React.FC<UserMenuInfoProps> = ({ username, picture, mobile, onClick }) => {
	const { wrapper } = useStyles({ mobile }).styles;

	return (
		<div className={wrapper} onClick={onClick}>
			<p>{username}</p>

			<Avatar src={picture || "avatar-placeholder-32.jpg"} />
		</div>
	);
};

export default memo(UserMenuInfo);
