import { createStyles } from "antd-style";

interface StyleProps {
	senderClickable: boolean;

	showUserInfo?: boolean;
	contextMenuOpened?: boolean;
}

export const useStyles = createStyles(
	({ css }, { senderClickable, showUserInfo, contextMenuOpened }: StyleProps) => {
		const wrapper = css`
			position: relative;

			width: 100%;

			display: flex;
			gap: var(--ant-padding-xs);

			padding: var(--ant-padding-xxs);

			transition: background-color var(--ant-motion-duration-fast)
				var(--ant-motion-ease-out-circ);

			${contextMenuOpened
				? "background-color: var(--ant-control-item-bg-active);"
				: `
				&:hover {
					background-color: var(--ant-control-item-bg-hover);
				}
			`}

			&&::after {
				content: "";

				position: absolute;
				inset: 0;

				background-color: var(--ant-yellow);

				pointer-events: none;

				opacity: var(--highlight-opacity);
			}
		`;

		return {
			wrapper,
			leftContentContainer: css`
				max-width: var(--ant-control-height-sm);
				flex-shrink: 0;

				padding-top: var(--ant-padding-${showUserInfo ? "xs" : "xxs"});
			`,
			body: css`
				flex: 1;

				overflow: hidden;
			`,
			avatar: css`
				${senderClickable && "cursor: pointer !important;"}
			`,
			text: css`
				left: 0 !important;

				width: 100%;

				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;

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
				margin: 0 !important;

				font-size: var(--ant-font-size-xs);
			`,
			editedText: css`
				flex: 1;

				display: flex;
				justify-content: flex-end;

				margin-top: var(--ant-padding-xxs);
			`,
			actionButtons: css`
				position: absolute;
				top: 0;
				right: var(--ant-padding);
				z-index: 1;

				display: none;
				gap: var(--ant-padding-xxs);

				padding: 2px;

				border-radius: var(--ant-border-radius-sm);
				border: 1px solid var(--ant-color-border);
				background-color: var(--ant-color-border-bg);
				transform: translateY(-50%);

				.acss-${wrapper.name}:hover & {
					display: flex;
				}
			`
		};
	}
);

