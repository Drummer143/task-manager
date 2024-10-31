import { useQuery } from '@tanstack/react-query'
import { Flex, Spin } from 'antd'
import api from 'api'
import React from 'react'
import TaskColumn from './widgets/TaskColumn'

import { statusArray } from 'shared/utils'
import { useStyles } from './styles'

const TaskTable: React.FC = () => {
    const { styles } = useStyles()

    const { data } = useQuery({
        queryKey: ['tasks'],
        queryFn: api.tasks.getList
    })

    if (!data) {
        return <Spin />
    }

    return (
        <Flex gap="1rem" className={styles.wrapper}>
            {statusArray.map((status) => (
                <TaskColumn key={status} status={status} tasks={data[status] || []} />
            ))}
        </Flex>
    )
}

export default TaskTable
