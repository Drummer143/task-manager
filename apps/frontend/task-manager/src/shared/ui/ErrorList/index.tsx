import React, { useMemo } from "react";

import { parseApiError } from "@task-manager/api";
import { Form } from "antd";
import { createStyles } from "antd-style";
import { AxiosError } from "axios";

interface ErrorListProps {
	error?: Error | AxiosError | null;
	center?: boolean;
}

const useStyles = createStyles(({ css }, { center }: { center?: boolean }) => ({
	errorList: css`
		color: var(--ant-color-error);

		${center && "text-align: center;"}

		.-item-explain-error::first-letter {
			text-transform: capitalize;
		}
	`
}));

const ErrorList: React.FC<ErrorListProps> = ({ error, center }) => {
	const { errorList } = useStyles({ center }).styles;

	const errors = useMemo(() => (error ? [parseApiError(error, undefined, true)] : undefined), [error]);

	return <Form.ErrorList errors={errors} className={errorList} />;
};

export default ErrorList;