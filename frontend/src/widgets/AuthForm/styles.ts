import { Form as AntForm } from "antd";
import styled from "styled-components";

export const FormContainer = styled.div`
	height: 100%;

	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	@media screen and (max-width: 480px) {
		padding: 0 0.5rem;
	}
`;

export const Form = styled(AntForm)`
	width: 25%;

	@media screen and (max-width: 1200px) {
		width: 40%;
	}

	@media screen and (max-width: 768px) {
		width: 80%;
	}

	@media screen and (max-width: 480px) {
		width: 100%;
	}
` as typeof AntForm;

export const CenteredFormItem = styled(AntForm.Item)`
	display: flex;
	justify-content: center;
`;
