import React, { memo } from "react";

import { Form } from "antd";
import { createStyles } from "antd-style";

interface ErrorMessageProps {
	error?: React.ReactNode;
}

const useStyles = createStyles(({ css }) => ({
	errorList: css`
		color: var(--ant-color-error);
		text-align: center;

		.-item-explain-error::first-letter {
			text-transform: capitalize;
		}
	`
}));

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
	const { errorList } = useStyles().styles;

	return <Form.ErrorList className={errorList} errors={[error]} />;
};

export default memo(ErrorMessage);