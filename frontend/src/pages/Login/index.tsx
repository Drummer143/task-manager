import { useMutation } from '@tanstack/react-query'
import { Form, Input } from 'antd'
import api from 'api'
import React, { useMemo } from 'react'
import { composeRules, email, required } from 'shared/validation'
import { Link, useNavigate } from 'react-router-dom'
import { parseUseQueryError } from 'shared/utils/errors'
import AuthForm from 'widgets/AuthForm'
import { ResetPasswordLink } from './styles'
import { withAuthPageProtection } from 'shared/HOCs/withAuthPageProtection'

const rules = {
    email: composeRules(required(), email()),
    password: required()
}

const Login: React.FC = () => {
    const navigate = useNavigate()

    const { mutateAsync, error, reset, isPending } = useMutation({
        mutationFn: api.auth.login,
        onSuccess: () => navigate('/profile', { replace: true })
    })

    const parsedError = useMemo(() => parseUseQueryError(error, undefined, [400]), [error])

    return (
        <AuthForm
            onFinish={mutateAsync}
            onValuesChange={reset}
            submitText="Login"
            headingText="Login"
            submitDisabled={!!parsedError}
            error={parsedError}
            submitLoading={isPending}
            bottomLink={
                <>
                    Don't have an account?
                    <Link to="/sign-up"> Sign up</Link>
                </>
            }
        >
            <Form.Item name="email" label="Email" rules={rules.email}>
                <Input placeholder="email@example.com" />
            </Form.Item>

            <Form.Item
                name="password"
                label="Password"
                rules={rules.password}
                extra={<ResetPasswordLink to="/reset-password">Forgot password?</ResetPasswordLink>}
            >
                <Input.Password placeholder="********" />
            </Form.Item>
        </AuthForm>
    )
}

export default withAuthPageProtection(Login)
