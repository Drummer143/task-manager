import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }, { opened }: { opened: boolean }) => {
	return {
		wrapper: css`
			height: var(--ant-control-height-lg);
			padding: 0 var(--ant-padding);
			background: var(--ant-color-bg-container);
			border-radius: ${opened
				? "var(--ant-border-radius) var(--ant-border-radius) 0 0"
				: "var(--ant-border-radius)"};
		`
	};
});

