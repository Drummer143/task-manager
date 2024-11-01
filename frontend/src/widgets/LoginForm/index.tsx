import { Button, FormProps } from 'antd'
import * as s from './styles'

type LoginFormProps<Values> = Omit<FormProps<Values>, 'children'> & {
    children: React.ReactNode
    submitText: string

    submitDisabled?: boolean
}

const LoginForm = <Values,>({ submitDisabled, submitText, children, ...props }: LoginFormProps<Values>) => {
    return (
        <s.FormContainer>
            <s.Form {...props}>
                {children}

                <s.SubmitButtonContainer>
                    <Button htmlType="submit" type="primary" disabled={submitDisabled}>
                        {submitText}
                    </Button>
                </s.SubmitButtonContainer>
            </s.Form>
        </s.FormContainer>
    )
}

export default LoginForm
