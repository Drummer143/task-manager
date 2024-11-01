import { Button, Form, FormProps, Typography } from 'antd'
import * as s from './styles'
import ErrorMessage from 'shared/ui/ErrorMessage'
import { memo } from 'react'

type LoginFormProps<Values> = Omit<FormProps<Values>, 'children' | 'layout'> & {
    children: React.ReactNode
    submitText: string

    error?: React.ReactNode
    bottomLink?: React.ReactNode
    headingText?: React.ReactNode
    submitLoading?: boolean
    submitDisabled?: boolean
}

const LoginForm = <Values,>({
    submitDisabled,
    submitText,
    children,
    bottomLink,
    error,
    submitLoading,
    headingText = 'Login',
    ...props
}: LoginFormProps<Values>) => {
    return (
        <s.FormContainer>
            <s.Form {...props} layout="vertical">
                <Form.Item>
                    <Typography.Title className="text-center" level={3}>
                        {headingText}
                    </Typography.Title>
                </Form.Item>

                {children}

                {error !== null && (
                    <s.CenteredFormItem status={error ? 'error' : undefined}>
                        <ErrorMessage error={error} />
                    </s.CenteredFormItem>
                )}

                <s.CenteredFormItem>
                    <Button
                        htmlType="submit"
                        type="primary"
                        disabled={submitDisabled}
                        loading={submitLoading}
                    >
                        {submitText}
                    </Button>
                </s.CenteredFormItem>

                {bottomLink && <s.CenteredFormItem>{bottomLink}</s.CenteredFormItem>}
            </s.Form>
        </s.FormContainer>
    )
}

export default memo(LoginForm) as typeof LoginForm
