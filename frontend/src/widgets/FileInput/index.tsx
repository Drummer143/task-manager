import React, { useRef } from 'react'
import { Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'

interface FileInputProps {
    accept?: string
    children?: React.ReactNode

    onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const FileInput: React.FC<FileInputProps> = ({ accept, onChange, children }) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleClick = () => {
        inputRef.current?.click()
    }

    return (
        <Button icon={<DownloadOutlined />} onClick={handleClick}>
            <input type="file" accept={accept} ref={inputRef} hidden onChange={onChange} />
            {children}
        </Button>
    )
}

export default FileInput
