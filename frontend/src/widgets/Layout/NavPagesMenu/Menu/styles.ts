import { DownOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

export const PageListTitleWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: var(--ant-padding-xxs);

	padding: var(--ant-padding-xxs);
`;

export const MenuWrapper = styled.div.attrs({
	className: "menu css-var-r3 ant-menu-css-var"
})`
	display: flex;
	flex-direction: column;

	color: var(--ant-color-text-secondary);
	background: var(--ant-menu-item-bg);
`;

export const SubmenuWrapper = styled(MenuWrapper).attrs({
	className: "submenu"
})`
	transition: height var(--ant-motion-duration-slow);
	background-color: var(--ant-menu-sub-menu-item-bg);
	overflow: hidden;
`;

export const MenuListItem = styled(NavLink).attrs({
	className: isActive => (isActive ? "active" : undefined)
})`
	min-height: var(--ant-menu-item-height);

	display: flex;
	justify-content: space-between;
	align-items: center;

	margin: var(--ant-menu-item-margin-block);

	padding-right: var(--ant-padding-xs);

	color: var(--ant-menu-item-color);
	transition:
		background-color var(--ant-motion-duration-slow),
		color var(--ant-motion-duration-slow);
	border-radius: var(--ant-menu-item-border-radius);

	&:hover {
		color: var(--ant-menu-item-color);
		background-color: var(--ant-menu-item-hover-bg);
	}

	&.active {
		color: var(--ant-menu-item-selected-color);
		background-color: var(--ant-menu-item-selected-bg);
	}

	.menu > & {
		padding-left: 24px;
	}

	.submenu > & {
		padding-left: 40px;
	}
`;

export const ExpandIcon = styled(DownOutlined)<{ open: boolean }>`
	transform: rotate(${props => (props.open ? 180 : 0)}deg);
	transition: transform var(--ant-motion-duration-slow);
`;
