import { useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import api from 'api'
import React from 'react'
import TaskColumn from './widgets/TaskColumn'

import { statusArray } from 'shared/utils'
import { StyledFlex } from './styles'

const TaskTable: React.FC = () => {
    const { data } = useQuery({
        queryKey: ['tasks'],
        queryFn: api.tasks.getList
    })

    if (!data) {
        return <Spin />
    }

    return (
        <StyledFlex gap="1rem">
            {statusArray.map((status) => (
                <TaskColumn key={status} status={status} tasks={data[status] || []} />
            ))}
        </StyledFlex>
    )
}

export default TaskTable
