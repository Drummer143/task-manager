import { useMutation } from '@tanstack/react-query'
import { Button, Form, Input } from 'antd'
import api from 'api'
import React from 'react'
import { StyledForm } from './styles'
import { composeRules, email, required } from 'shared/validation'

const rules = {
    email: composeRules(required(), email()),
    password: required()
}

const Login: React.FC = () => {
    const { mutateAsync } = useMutation({
        mutationFn: api.auth.login
    })

    return (
        <StyledForm onFinish={mutateAsync} layout='vertical'>
            <Form.Item name="email" label="Email" rules={rules.email}>
                <Input placeholder="email@example.com" />
            </Form.Item>

            <Form.Item name="password" label="Password" rules={rules.password}>
                <Input placeholder="********" />
            </Form.Item>

            <Form.Item>
                <Button htmlType="submit">Login</Button>
            </Form.Item>
        </StyledForm>
    )
}

export default Login
