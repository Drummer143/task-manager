import { useMutation } from '@tanstack/react-query'
import { Form, Input } from 'antd'
import api from 'api'
import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { parseUseQueryError } from 'shared/utils/errors'
import { composeRules, email, password, range, required } from 'shared/validation'
import LoginForm from 'widgets/LoginForm'

const rules = {
    username: composeRules(required(), range({ min: 5, max: 20, type: 'string' })),
    email: composeRules(required(), email()),
    password: composeRules(required(), password())
}

const SignUp: React.FC = () => {
    const navigate = useNavigate()

    const { mutateAsync, error, isPending, reset } = useMutation({
        mutationFn: api.auth.signUp,
        onSuccess: () => navigate('/login')
    })

    const parsedError = useMemo(() => parseUseQueryError(error, undefined, [400]), [error])

    return (
        <LoginForm
            submitText="Sign Up"
            onFinish={mutateAsync}
            error={parsedError}
            submitLoading={isPending}
            submitDisabled={!!parsedError}
            onValuesChange={reset}
            bottomLink={
                <>
                    Already have an account?
                    <Link to="/login"> Login</Link>
                </>
            }
        >
            <Form.Item name="username" label="Username" rules={rules.username}>
                <Input placeholder="username" type="text" autoComplete="name" />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={rules.email}>
                <Input type="email" placeholder="email@example.com" />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={rules.password}>
                <Input.Password placeholder="********" autoComplete="new-password" />
            </Form.Item>
        </LoginForm>
    )
}

export default SignUp
