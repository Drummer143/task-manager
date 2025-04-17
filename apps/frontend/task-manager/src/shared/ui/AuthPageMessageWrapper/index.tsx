import { GetProps, Typography } from "antd";
import { createStyles } from "antd-style";

const useStyles = createStyles(({ css }) => ({
	wrapper: css`
		height: 100%;

		padding: 0 var(--ant-padding);

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		text-align: center;
	`
}));

const AuthPageMessageWrapper = (props: GetProps<typeof Typography>) => {
	const {
		styles: { wrapper },
		cx
	} = useStyles();

	return <Typography {...props} className={cx(wrapper, props.className)} />;
};

export default AuthPageMessageWrapper;
