import React, { memo, useCallback, useState } from "react";

import { Drawer, DrawerProps } from "antd";
import { createStyles } from "antd-style";

const SWIPE_DISTANCE_TO_CLOSE = 50;

type MobileDrawerProps = Omit<
	DrawerProps,
	"placement" | "drawerRender" | "keyboard" | "afterOpenChange" | "onClose"
> & {
	onClose: () => void;
};

const useStyles = createStyles(({ css }, { shiftX }: { shiftX: number }) => ({
	mobileDrawer: css`
		transform: translateX(${shiftX}px);

		.ant-drawer-body {
			padding: 0;
		}
	`
}));

const MobileDrawer: React.FC<MobileDrawerProps> = props => {
	const [touchStartX, setTouchStartX] = useState(0);
	const [touchMoveX, setTouchMoveX] = useState(0);

	const { styles, cx } = useStyles({ shiftX: touchMoveX });

	const handleTouchStart = useCallback<React.TouchEventHandler<HTMLDivElement>>(e => {
		e.stopPropagation();
		setTouchStartX(e.touches[0].clientX);
	}, []);

	const handleTouchMove = useCallback<React.TouchEventHandler<HTMLDivElement>>(
		e => {
			e.stopPropagation();
			setTouchMoveX(Math.min(0, e.touches[0].clientX - touchStartX));
		},
		[touchStartX]
	);

	const handleTouchEnd = useCallback<React.TouchEventHandler<HTMLDivElement>>(
		e => {
			e.stopPropagation();
			const touchEndX = e.changedTouches[0].clientX;

			if (touchStartX - touchEndX > SWIPE_DISTANCE_TO_CLOSE) {
				props.onClose();
			} else {
				setTouchMoveX(0);
				setTouchStartX(0);
			}
		},
		[props, touchStartX]
	);

	const handleAfterOpenChange = useCallback((open: boolean) => {
		if (!open) {
			setTouchMoveX(0);
			setTouchStartX(0);
		}
	}, []);

	const drawerRender = useCallback(
		(node: React.ReactNode) => (
			<div
				className="w-full h-full"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onTouchCancel={handleTouchEnd}
			>
				{node}
			</div>
		),
		[handleTouchEnd, handleTouchMove, handleTouchStart]
	);

	return (
		<Drawer
			placement="left"
			keyboard={false}
			afterOpenChange={handleAfterOpenChange}
			drawerRender={drawerRender}
			{...props}
			className={cx(styles.mobileDrawer, props.className)}
		/>
	);
};

export default memo(MobileDrawer);