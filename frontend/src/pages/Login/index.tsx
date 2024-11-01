import { useMutation } from '@tanstack/react-query'
import { Form, Input } from 'antd'
import api from 'api'
import React, { useMemo } from 'react'
import { composeRules, email, required } from 'shared/validation'
import { useNavigate } from 'react-router-dom'
import { parseUseQueryError } from 'shared/utils/errors'
import ErrorMessage from 'shared/ui/ErrorMessage'
import LoginForm from 'widgets/LoginForm'

const rules = {
    email: composeRules(required(), email()),
    password: required()
}

const Login: React.FC = () => {
    const navigate = useNavigate()

    const { mutateAsync, error, reset } = useMutation({
        mutationFn: api.auth.login,
        onSuccess: () => {
            navigate('/profile')
        }
    })

    const parsedError = useMemo(() => parseUseQueryError(error, undefined, [400]), [error])

    return (
        <LoginForm
            onFinish={mutateAsync}
            onValuesChange={reset}
            layout="vertical"
            submitText="Login"
            submitDisabled={!!parsedError}
        >
            <Form.Item name="email" label="Email" rules={rules.email}>
                <Input placeholder="email@example.com" />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={rules.password}>
                <Input.Password placeholder="********" />
            </Form.Item>

            <Form.Item status={parsedError ? 'error' : undefined}>
                <ErrorMessage error={parsedError} />
            </Form.Item>
        </LoginForm>
    )
}

export default Login
