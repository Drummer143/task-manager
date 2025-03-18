import React, { memo } from "react";

import { Form } from "antd";
import styled from "styled-components";

interface ErrorMessageProps {
	error?: React.ReactNode;
}

const SErrorList = styled(Form.ErrorList)`
	color: var(--ant-color-error);
	text-align: center;

	.-item-explain-error::first-letter {
		text-transform: capitalize;
	}
`;

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
	return <SErrorList errors={[error]} />;
};

export default memo(ErrorMessage);
