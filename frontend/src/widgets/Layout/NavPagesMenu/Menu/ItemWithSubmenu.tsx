import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, theme } from "antd";

import { ExpandIcon, MenuListItem, SubmenuWrapper } from "./styles";

interface ItemWithSubmenuProps {
	rootPage: Pick<Page, "childPages" | "title" | "type" | "id">;
	onSubPageCreate: (id: string) => void;
}

const ItemWithSubmenu: React.FC<ItemWithSubmenuProps> = ({ onSubPageCreate, rootPage }) => {
	const [openStatus, setOpenStatus] = useState<"opened" | "pre-opening" | "opening" | "closing" | "closed">("closed");

	const token = theme.useToken().token;

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
			<MenuListItem to={`/pages/${rootPage.id}`}>
				{rootPage.title}

				<Flex gap="var(--ant-padding-xxs)">
					{!!rootPage.childPages?.length && (
						<Button
							type="text"
							size="small"
							icon={<ExpandIcon open={openStatus === "opened" || openStatus === "opening"} />}
							onClick={handleExpandButtonClick}
						/>
					)}

					<Button size="small" type="text" icon={<PlusOutlined />} onClick={handleSubPageCreate} />
				</Flex>
			</MenuListItem>

			<SubmenuWrapper
				onTransitionEnd={e =>
					e.propertyName === "height" && setOpenStatus(prev => (prev === "opening" ? "opened" : "closed"))
				}
				style={{
					height: openStatus === "opening" || openStatus === "opened" ? totalSubmenuHeight : 0,
					display: openStatus === "closed" ? "none" : undefined
				}}
			>
				{rootPage.childPages?.map(item => (
					<MenuListItem key={item.id} to={`/pages/${item.id}`}>
						{item.title}
					</MenuListItem>
				))}
			</SubmenuWrapper>
		</>
	);
};

export default memo(ItemWithSubmenu);
