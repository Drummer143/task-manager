import React from 'react'
import NewTaskForm from './widgets/NewTaskForm'
import TaskTable from './widgets/TaskTable'
import { useDisclosure } from 'shared/hooks'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const Tasks: React.FC = () => {
    const { onClose, onOpen, open } = useDisclosure()

    return (
        <>
            <NewTaskForm open={open} onClose={onClose} />

            <Button icon={<PlusOutlined />} type="primary" onClick={onOpen}>
                New Task
            </Button>
            <TaskTable />
        </>
    )
}

export default Tasks
