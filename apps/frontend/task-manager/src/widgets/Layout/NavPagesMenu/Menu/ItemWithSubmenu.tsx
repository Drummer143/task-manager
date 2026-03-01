import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import { DownOutlined, PlusOutlined } from "@ant-design/icons";
import { PageResponse } from "@task-manager/api/main/schemas";
import { Button, Flex, theme } from "antd";
import { NavLink } from "react-router";

import { useStyles } from "./styles";

interface ItemWithSubmenuProps {
	rootPage: PageResponse;
	onSubPageCreate: (id: string) => void;
}

const ItemWithSubmenu: React.FC<ItemWithSubmenuProps> = ({ onSubPageCreate, rootPage }) => {
	const [openStatus, setOpenStatus] = useState<"opened" | "pre-opening" | "opening" | "closing" | "closed">("closed");

	const token = theme.useToken().token;

	const { styles, cx } = useStyles({ open: openStatus === "opened" || openStatus === "opening" });

	const totalSubmenuHeight = useMemo(() => {
		if (!rootPage.childPages) {
			return;
		}

		return (
			rootPage.childPages.length *
				(typeof token.Menu?.itemHeight === "string"
					? parseInt(token.Menu.itemHeight)
					: token.Menu?.itemHeight || 40) +
			rootPage.childPages.length *
				((typeof token.Menu?.itemMarginBlock === "string"
					? parseInt(token.Menu.itemMarginBlock)
					: token.Menu?.itemMarginBlock || 4) *
					2)
		);
	}, [rootPage.childPages, token.Menu?.itemHeight, token.Menu?.itemMarginBlock]);

	const handleExpandButtonClick: React.MouseEventHandler = useCallback(e => {
		e.stopPropagation();
		e.preventDefault();

		setOpenStatus(prev => (prev === "closed" || prev === "closing" ? "pre-opening" : "closing"));
	}, []);

	const handleSubPageCreate: React.MouseEventHandler = useCallback(
		e => {
			e.stopPropagation();
			e.preventDefault();

			onSubPageCreate(rootPage.id);
		},
		[onSubPageCreate, rootPage.id]
	);

	useEffect(() => {
		if (openStatus === "pre-opening") {
			const timeout = setTimeout(() => setOpenStatus("opening"), 10);

			return () => clearTimeout(timeout);
		}
	}, [openStatus]);

	return (
		<>
			<NavLink
				className={({ isActive }) => cx(styles.menuListItem, isActive && "active")}
				to={`/pages/${rootPage.id}`}
			>
				{rootPage.title}

				<Flex gap="var(--ant-padding-xxs)">
					{!!rootPage.childPages?.length && (
						<Button type="text" size="small" icon={<DownOutlined />} onClick={handleExpandButtonClick} />
					)}

					<Button size="small" type="text" icon={<PlusOutlined />} onClick={handleSubPageCreate} />
				</Flex>
			</NavLink>

			<div
				className={cx("submenu", styles.menuWrapper)}
				onTransitionEnd={e =>
					e.propertyName === "height" && setOpenStatus(prev => (prev === "opening" ? "opened" : "closed"))
				}
				style={{
					height: openStatus === "opening" || openStatus === "opened" ? totalSubmenuHeight : 0,
					display: openStatus === "closed" ? "none" : undefined
				}}
			>
				{rootPage.childPages?.map(item => (
					<NavLink
						className={({ isActive }) => cx(styles.menuListItem, isActive && "active")}
						key={item.id}
						to={`/pages/${item.id}`}
					>
						{item.title}
					</NavLink>
				))}
			</div>
		</>
	);
};

export default memo(ItemWithSubmenu);