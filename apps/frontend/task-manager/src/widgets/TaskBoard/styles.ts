import { createStyles } from "antd-style";

const colWidth = "minmax(280px, 1fr)";

const getColsTemplate = (cols: number, withDivider?: boolean) => {
	if (!withDivider) {
		return `repeat(${cols}, ${colWidth})`;
	}

	const template = new Array(cols).fill(colWidth).join(" min-content ");

	return "min-content " + template + " min-content";
};

export const useStyles = createStyles(
	(
		{ css },
		{
			cols,
			withDivider,
			height
		}: {
			cols: number;
			withDivider?: boolean;
			height?: React.CSSProperties["height"];
		}
	) => ({
		container: css`
			${height && `height: ${height};`}

			display: grid;
			gap: var(--ant-padding-xxs);
			grid-template-columns: ${getColsTemplate(cols, withDivider)};

			padding: var(--ant-padding-xs) var(--ant-padding-xxs);
			overflow-x: auto;
		`
	})
);

