import React, { useMemo } from 'react'
import { Button, Form, Input } from 'antd'

import { required } from 'shared/validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from 'api'

interface UserInfoFormProps {
    name: string
    nickname: string
    username: string
}

const requiredRule = required()

const UserInfoForm: React.FC<UserInfoFormProps> = ({ name, nickname, username }) => {
    const queryClient = useQueryClient()

    const initialValues = useMemo(() => ({ name, nickname, username }), [name, nickname, username])

    const { mutateAsync } = useMutation({
        mutationFn: api.profile.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        }
    })

    return (
        <Form layout="vertical" initialValues={initialValues} onFinish={mutateAsync}>
            <Form.Item label="Name" name="name" rules={requiredRule}>
                <Input value={name} placeholder="Enter your name" />
            </Form.Item>

            <Form.Item label="Nickname" name="nickname" rules={requiredRule}>
                <Input value={nickname} placeholder="Enter your nickname" />
            </Form.Item>

            <Form.Item label="Username" name="username" rules={requiredRule}>
                <Input value={username} placeholder="Enter your username" />
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
