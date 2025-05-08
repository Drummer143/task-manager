import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, isDarkMode }) => ({
	wrapper: css`
		& > * {
			transition: transform var(--ant-motion-duration-slow) ease;
		}
	`,
	menu: css`
		display: flex;
		flex-direction: row;
		gap: var(--ant-padding-xxs);

		padding: var(--ant-padding-xxs);

		border-radius: var(--ant-border-radius);
		box-shadow: var(--ant-box-shadow-secondary);
		background-color: var(--ant-color-bg-elevated);
	`,
	menuButton: css`
		&.active {
			background-color: var(--ant-color-bg-text-active);
		}

		span {
			line-height: 1;
		}
	`,
	buttonIcon: css`
		svg {
			width: 18px;
			height: 18px;
		}
	`,
	buttonTooltip: css`
		.ant-typography {
			color: ${isDarkMode ? undefined : "rgba(255,255,255,0.85)"};

			&.ant-typography-secondary {
				color: ${isDarkMode ? undefined : "rgba(255,255,255,0.65)"};
			}
		}
	`
}));

