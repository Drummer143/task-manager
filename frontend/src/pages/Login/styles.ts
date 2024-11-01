import { Form as AntForm } from "antd";
import styled from "styled-components";

export const Form = styled(AntForm)`
	height: 100%;

	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	@media screen and (max-width: 480px) {
		padding: 0 0.5rem;
	}
` as typeof AntForm

export const FormItem = styled(AntForm.Item)`
	width: 25%;

	transition: width 0.5s ease;

	@media screen and (max-width: 1024px) {
		width: 40%;
	}

	@media screen and (max-width: 768px) {
		width: 80%;
	}

	@media screen and (max-width: 480px) {
		width: 100%;
	}
`
