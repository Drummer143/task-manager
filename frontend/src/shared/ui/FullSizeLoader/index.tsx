import { Flex, Spin } from 'antd'
import React from 'react'

const FullSizeLoader: React.FC = () => {
    return (
        <Flex
            align="center"
            justify="center"
            style={{ height: '100%', backgroundColor: 'var(--ant-color-bg-layout)' }}
        >
            <Spin size="large" />
        </Flex>
    )
}

export default FullSizeLoader
