import { createStyles } from "antd-style";

interface StyleProps {
	senderClickable: boolean;

	showUserInfo?: boolean;
	contextMenuOpened?: boolean;
}

export const useStyles = createStyles(
	({ css }, { senderClickable, showUserInfo, contextMenuOpened }: StyleProps) => {
		const wrapper = css`
			width: 100%;

			padding: var(--ant-padding-xxs)
				${showUserInfo && "var(--ant-padding-xs) var(--ant-padding-xs)"};
			transition: background-color var(--ant-motion-duration-fast)
				var(--ant-motion-ease-out-circ);

			${contextMenuOpened
				? "background-color: var(--ant-control-item-bg-active);"
				: `
				&:hover {
					background-color: var(--ant-control-item-bg-hover);
				}
			`}
		`;

		return {
			wrapper,
			leftContentContainer: css`
				max-width: var(--ant-control-height-sm);
				flex-shrink: 0;

				padding-top: ${showUserInfo ? "var(--ant-padding-xs);" : "var(--ant-padding-xxs);"};
			`,
			body: css`
				flex: 1;
			`,
			avatar: css`
				${senderClickable && "cursor: pointer !important;"}
			`,
			text: css`
				width: 100%;
				left: 0 !important;

				margin: 0 !important;
			`,
			date: css`
				align-self: flex-end;

				display: block;

				font-size: 10px;
				opacity: 0;
				line-height: 1;
				transition: opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-out-circ);

				.acss-${wrapper.name}:hover & {
					opacity: 1;
				}
			`,
			editButtons: css`
				margin-top: var(--ant-padding-xs);
			`,
			senderName: css`
				font-weight: var(--ant-font-weight-strong);
				font-size: var(--ant-font-size-lg);
			`,
			secondaryText: css`
				font-size: var(--ant-font-size-xs);
			`,
			editedText: css`
				display: flex;
				justify-content: flex-end;

				margin-top: var(--ant-padding-xxs);
			`
		};
	}
);

