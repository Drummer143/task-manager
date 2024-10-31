import React, { useMemo } from 'react'
import { Button, Form, Input } from 'antd'

import { composeRules, email, required } from 'shared/validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from 'api'

interface EmailFormProps {
    email: string
}

const requiredRule = composeRules(required(), email())

const EmailForm: React.FC<EmailFormProps> = ({ email }) => {
    const queryClient = useQueryClient()

    const initialValues = useMemo(() => ({ email }), [email])

    const { mutateAsync } = useMutation({
        mutationFn: api.profile.changeEmail,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
        onError: (error) => console.debug(error.message)
    })

    return (
        <Form
            layout="vertical"
            initialValues={initialValues}
            onFinish={mutateAsync}
            className="w-full"
        >
            <Form.Item label="Email" name="email" rules={requiredRule}>
                <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" type="primary">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
}

export default EmailForm
