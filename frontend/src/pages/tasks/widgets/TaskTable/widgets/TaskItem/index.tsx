import React, { memo } from 'react'
import { statusColors } from 'shared/utils'
import { useStyles } from './styles'

interface TaskItemProps {
    task: Task

    onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDragStart }) => {
    const { styles } = useStyles(statusColors[task.status])

    return (
        <div draggable onDragStart={(e) => onDragStart(e, task)} className={styles.task}>
            <p>{task.title}</p>
        </div>
    )
}

export default memo(
    TaskItem,
    (prev, next) => prev.task.id === next.task.id && prev.onDragStart === next.onDragStart
)
