import React, { memo } from "react";

import { Avatar } from "antd";
import styled, { css } from "styled-components";

interface UserMenuInfoProps {
	mobile?: boolean;
	picture?: string;
	username?: string;

	onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Wrapper = styled.div<{ mobile?: boolean }>`
	height: fit-content;

	padding: 0.5rem 0;

	display: flex;
	gap: 0.75rem;
	align-items: center;

	cursor: pointer;

	${({ mobile }) =>
		mobile &&
		css`
			width: fit-content;

			margin: 0 auto;
		`}

	p {
		margin: 0;
	}
`;

const UserMenuInfo: React.FC<UserMenuInfoProps> = ({ username, picture, mobile, onClick }) => (
	<Wrapper mobile={mobile} onClick={onClick}>
		<p>{username}</p>

		<Avatar src={picture || "avatar-placeholder-32.jpg"} />
	</Wrapper>
);

export default memo(UserMenuInfo);
