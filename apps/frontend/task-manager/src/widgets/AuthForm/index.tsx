import { memo } from "react";

import { Button, Form, FormProps, Typography } from "antd";

import * as s from "./styles";

import ErrorMessage from "../../shared/ui/ErrorMessage";

type AuthFormProps<Values> = Omit<FormProps<Values>, "children" | "layout"> & {
	children: React.ReactNode;
	submitText: string;

	error?: React.ReactNode;
	bottomLink?: React.ReactNode;
	headingText?: React.ReactNode;
	submitLoading?: boolean;
};

const AuthForm = <Values,>({
	submitText,
	children,
	bottomLink,
	error,
	submitLoading,
	headingText = "Login",
	...props
}: AuthFormProps<Values>) => {
	const { styles, cx } = s.useStyles();

	return (
		<div className={styles.formContainer}>
			<Form {...props} className={cx(styles.form, props.className)} layout="vertical">
				<Form.Item>
					<Typography.Title className="text-center" level={3}>
						{headingText}
					</Typography.Title>
				</Form.Item>

				{children}

				{error !== null && (
					<Form.Item className={styles.centeredFormItem} status={error ? "error" : undefined}>
						<ErrorMessage error={error} />
					</Form.Item>
				)}

				<Form.Item className={styles.centeredFormItem}>
					<Button htmlType="submit" type="primary" loading={submitLoading}>
						{submitText}
					</Button>
				</Form.Item>

				{bottomLink && <Form.Item className={styles.centeredFormItem}>{bottomLink}</Form.Item>}
			</Form>
		</div>
	);
};

export default memo(AuthForm) as typeof AuthForm;