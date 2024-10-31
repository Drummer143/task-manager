import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, DatePicker, Drawer, Form, Input, Select, Space } from 'antd'
import api from 'api'
import React, { useCallback } from 'react'
import { today } from 'shared/utils'
import { FormValues, NewTaskFormProps } from './types'
import { initialValues, requiredRule, statusSelectOptions } from './utils'

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onClose, open }) => {
    const queryClient = useQueryClient()

    const [form] = Form.useForm<FormValues>()

    const { mutateAsync } = useMutation({
        mutationFn: api.tasks.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
    })

    const handleSubmit = useCallback(
        async (values: FormValues) => {
            try {
                await mutateAsync({ ...values, dueDate: values.dueDate?.toISOString() })

                onClose()
            } catch { /* empty */ }
        },
        [mutateAsync, onClose]
    )

    const handleCancel = () => {
        form.resetFields()
        onClose()
    }

    return (
        <Drawer
            open={open}
            onClose={handleCancel}
            keyboard
            drawerRender={(node) => (
                <Form
                    className='h-full'
                    initialValues={initialValues}
                    onFinish={handleSubmit}
                    form={form}
                    layout="vertical"
                >
                    {node}
                </Form>
            )}
            extra={
                <Space>
                    <Button htmlType="reset" form="create-task" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button htmlType="submit" form="create-task" type="primary">
                        Create
                    </Button>
                </Space>
            }
        >
            <Form.Item label="Title" name="title" rules={requiredRule}>
                <Input placeholder="Enter task title" />
            </Form.Item>

            <Form.Item label="Status" name="status" rules={requiredRule}>
                <Select placeholder="Select task status" options={statusSelectOptions} />
            </Form.Item>

            <Form.Item label="Due Date" name="dueDate">
                <DatePicker minDate={today} showTime className='w-full' />
            </Form.Item>

            <Form.Item label="Description" name="description">
                <Input.TextArea placeholder="Enter task description" />
            </Form.Item>
        </Drawer>
    )
}

export default NewTaskForm
