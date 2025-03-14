import React, { useMemo } from "react";

import { Form } from "antd";
import { AxiosError } from "axios";
import styled from "styled-components";

import { parseUseQueryError } from "shared/utils";

interface ErrorListProps {
	error?: Error | AxiosError | null;
	center?: boolean;
}

const Errors = styled(Form.ErrorList)<{ center?: boolean }>`
	color: var(--ant-color-error);

	${({ center }) => center && "text-align: center;"}

	.-item-explain-error::first-letter {
		text-transform: capitalize;
	}
`;

const ErrorList: React.FC<ErrorListProps> = ({ error, center }) => {
	const errors = useMemo(() => (error ? [parseUseQueryError(error, undefined, true)] : undefined), [error]);

	return <Errors errors={errors} center={center} />;
};

export default ErrorList;
