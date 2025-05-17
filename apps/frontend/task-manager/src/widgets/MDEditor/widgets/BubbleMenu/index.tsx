import React, { memo } from "react";

import Icon from "@ant-design/icons";
import { Editor, BubbleMenu as TipTapBubbleMenu } from "@tiptap/react";
import { Button, Tooltip, Typography } from "antd";

import { useStyles } from "./styles";

import { BoldSvg, CodeSvg, ItalicSvg, StrikethroughSvg } from "../../icons";

interface BubbleMenuProps {
	editor: Editor | null;
	selectionParams: {
		Bold: boolean;
		Italic: boolean;
		Strike: boolean;
		Code: boolean;
	};

	onItemClick: (action: "Bold" | "Italic" | "Strike" | "Code") => void;
}

const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);

const bubbleMenuButtons = [
	{
		action: "Bold",
		icon: BoldSvg,
		shortcut: [isMac ? "cmd" : "ctrl", "b"]
	},
	{
		action: "Italic",
		icon: ItalicSvg,
		shortcut: [isMac ? "cmd" : "ctrl", "i"]
	},
	{
		action: "Strike",
		icon: StrikethroughSvg,
		shortcut: [isMac ? "cmd" : "ctrl", "shift", "s"]
	},
	{
		action: "Code",
		icon: CodeSvg,
		shortcut: [isMac ? "cmd" : "ctrl", "e"]
	}
] as const;

const BubbleMenu: React.FC<BubbleMenuProps> = ({ editor, selectionParams, onItemClick }) => {
	const { styles, cx } = useStyles();

	return (
		<TipTapBubbleMenu
			tippyOptions={{
				moveTransition:
					"transform var(--ant-motion-duration-fast) var(--ant-motion-ease-in-out)"
			}}
			editor={editor}
			className={styles.menu}
		>
			{bubbleMenuButtons.map(({ action, icon, shortcut }) => (
				<Tooltip
					classNames={{ body: styles.buttonTooltip }}
					title={
						<Typography.Text>
							{action}{" "}
							<Typography.Text type="secondary">
								{shortcut.map(key => (
									<Typography.Text keyboard key={key}>
										{key}
									</Typography.Text>
								))}
							</Typography.Text>
						</Typography.Text>
					}
				>
					<Button
						type="text"
						size="small"
						icon={<Icon className={styles.buttonIcon} component={icon} />}
						onClick={() => onItemClick(action)}
						className={cx(styles.menuButton, selectionParams[action] && "active")}
					/>
				</Tooltip>
			))}
		</TipTapBubbleMenu>
	);
};

export default memo(BubbleMenu);

