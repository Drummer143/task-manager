import { useMutation } from '@tanstack/react-query'
import { Button, Form, Input } from 'antd'
import api from 'api'
import React from 'react'

const Login: React.FC = () => {
    const { mutateAsync } = useMutation({
        mutationFn: api.auth.login
    })

    return (
        <Form onFinish={mutateAsync}>
            <Form.Item name="email">
                <Input placeholder="Username" />
            </Form.Item>

            <Form.Item name="password">
                <Input placeholder="Password" />
            </Form.Item>

            <Form.Item>
                <Button htmlType="submit">Login</Button>
            </Form.Item>
        </Form>
    )
}

export default Login
