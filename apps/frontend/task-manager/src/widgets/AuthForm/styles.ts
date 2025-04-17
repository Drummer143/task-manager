import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, responsive }) => ({
	formContainer: css`
		height: 100%;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		${responsive.xs} {
			padding: 0 0.5rem;
		}
	`,
	form: css`
		width: 25%;

		${responsive.lg} {
			width: 40%;
		}

		${responsive.sm} {
			width: 80%;
		}

		${responsive.xs} {
			width: 100%;
		}
	`,
	centeredFormItem: css`
		display: flex;
		justify-content: center;
	`
}));