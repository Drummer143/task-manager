import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }, { cols }: { cols: number }) => ({
	container: css`
		display: grid;
		gap: var(--ant-padding-xxs);
		grid-template-columns: repeat(${cols}, minmax(280px, 1fr));

		padding: var(--ant-padding-xs) var(--ant-padding-xxs);
		overflow-x: auto;
	`
}));
