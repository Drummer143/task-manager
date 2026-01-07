import { useCallback, useEffect, useRef, useState } from "react";

import { useClickOutside } from "@task-manager/react-utils";
import { computePosition } from "@task-manager/utils";
import { Button, Flex, Typography } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

import { setContextMenuListener, ViewItemInfo } from "../core";

interface ContextMenuProps
	extends Omit<
		React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
		"onContextMenu" | "ref"
	> {
	children: React.ReactNode;
}

const ContextMenu: React.FC<ContextMenuProps> = props => {
	const [ctxInfo, setCtxInfo] = useState<
		| {
				items: ViewItemInfo[];
				x: number;
				y: number;
		  }
		| undefined
	>(undefined);

	const ctxRootRef = useRef<HTMLDivElement>(null);

	const handleClickOutside = useCallback(() => setCtxInfo(undefined), []);

	const ctxRef = useClickOutside<HTMLDivElement>(handleClickOutside, !!ctxInfo);

	const wrapItemOnClick = useCallback((onClick: () => void) => {
		return () => {
			onClick();
			setCtxInfo(undefined);
		};
	}, []);

	useEffect(() => {
		if (!ctxRootRef.current) {
			return;
		}

		return setContextMenuListener({
			root: ctxRootRef.current,
			onContextMenu: (items, event) => {
				const { x, y } = computePosition({
					anchorX: event.clientX,
					anchorY: event.clientY,
					elementWidth: 100,
					elementHeight: 100,
					offset: 10,
					viewportPadding: 10
				});

				setCtxInfo({ items, x, y });
			}
		});
	}, []);

	const ctxPortalRoot = document.querySelector(".ant-app");

	const ctxPortal = ctxPortalRoot
		? createPortal(
				<AnimatePresence>
					{ctxInfo && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.1 }}
							ref={ctxRef}
							style={{
								position: "absolute",
								zIndex: 10000,
								minWidth: "128px",
								left: ctxInfo.x,
								top: ctxInfo.y,
								padding: "var(--ant-padding-xs)",
								backgroundColor: "var(--ant-color-bg-elevated)",
								borderRadius: "var(--ant-border-radius)",
								boxShadow: "var(--ant-box-shadow-secondary)"
							}}
						>
							{ctxInfo.items.map((item, i) => (
								<Flex key={item.name} vertical>
									{ctxInfo.items.length > 1 && item.name && (
										<Typography.Text
											style={{
												...(i === 0
													? { marginBottom: "var(--ant-margin-xxs)" }
													: { margin: "var(--ant-margin-xxs) 0" }),
												lineHeight: 1.25
											}}
											type="secondary"
										>
											{item.name}
										</Typography.Text>
									)}

									{item.menu.map(menuItem => (
										<Button
											style={{ justifyContent: "flex-start" }}
											onClick={wrapItemOnClick(menuItem.onClick)}
											type="text"
											danger={menuItem.danger}
											key={menuItem.title}
										>
											{menuItem.title}
										</Button>
									))}
								</Flex>
							))}
						</motion.div>
					)}
				</AnimatePresence>,
				ctxPortalRoot
			)
		: null;

	return (
		<div {...props} style={{ height: "100%", ...props.style }} ref={ctxRootRef}>
			{props.children}
			{ctxPortal}
		</div>
	);
};

export default ContextMenu;
