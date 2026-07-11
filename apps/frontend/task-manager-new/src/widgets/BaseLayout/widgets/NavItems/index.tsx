import React, { useMemo } from "react";

import { FileTextOutlined, MessageOutlined, ProjectOutlined } from "@ant-design/icons";
import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";
import { Flex, Typography } from "antd";
import cx from "classnames";
import { NavLink, NavLinkRenderProps, useNavigate } from "react-router";

import styles from "./styles.module.scss";

const navLinkClassName = ({ isActive }: NavLinkRenderProps) =>
	cx(styles.link, { [styles.active]: isActive });

interface MenuItem {
	key: string;
	label: string;
	Icon: React.ForwardRefExoticComponent<
		Omit<AntdIconProps, "ref"> & React.RefAttributes<HTMLSpanElement>
	>;

	onClick: () => void;
}

const NavItems: React.FC = () => {
	const navigate = useNavigate();

	const items = useMemo<MenuItem[]>(
		() => [
			{
				key: "docs",
				label: "Docs",
				Icon: FileTextOutlined,
				onClick: () => navigate("docs")
			},
			{
				key: "tasks",
				label: "Tasks",
				Icon: ProjectOutlined,
				onClick: () => navigate("tasks")
			},
			{
				key: "chat",
				label: "Chat",
				Icon: MessageOutlined,
				onClick: () => navigate("chat")
			}
		],
		[navigate]
	);

	return (
		<Flex gap="6px" vertical>
			{items.map(item => (
				<NavLink key={item.key} to={item.key} className={navLinkClassName}>
					<Typography.Text className={styles.linkText}>
						<item.Icon />
						<span className={styles.linkLabel}>{item.label}</span>
					</Typography.Text>
				</NavLink>
			))}
		</Flex>
	);
};

export default NavItems;

