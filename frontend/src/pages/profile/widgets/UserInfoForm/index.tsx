import React from 'react'
import { Button, Form, Input } from 'antd'

import { required } from 'shared/validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from 'api'

interface UserInfoFormProps {
    username: string
}

const requiredRule = required()

const UserInfoForm: React.FC<UserInfoFormProps> = (props) => {
    const queryClient = useQueryClient()

    const { mutateAsync } = useMutation({
        mutationFn: api.profile.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        }
    })

    return (
        <Form layout="vertical" initialValues={props} onFinish={mutateAsync}>
            <Form.Item label="Username" name="username" rules={requiredRule}>
                <Input placeholder="Enter your username" />
            </Form.Item>

            <Form.Item>
                <Button htmlType="submit" type="primary">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
}

export default UserInfoForm
