import React, { memo } from "react";

import { Avatar } from "antd";
import { createStyles } from "antd-style";

import { useAuthStore } from "../../../app/store/auth";
import { buildStorageUrl } from "../../../shared/utils/buildStorageUrl";

interface UserMenuInfoProps {
	mobile?: boolean;
	picture?: string | null;
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
			line-height: 1;
		}
	`
}));

const UserMenuInfo: React.FC<UserMenuInfoProps> = ({ username, picture, mobile, onClick }) => {
	const { wrapper } = useStyles({ mobile }).styles;

	return (
		<div className={wrapper} onClick={onClick}>
			<p data-test-id="user-menu-top-right-info-username">{username}</p>

			<Avatar
				src={
					picture
						? buildStorageUrl(picture, useAuthStore.getState().identity.access_token)
						: "avatar-placeholder-32.jpg"
				}
			/>
		</div>
	);
};

export default memo(UserMenuInfo);
