import { Flex, Spin } from 'antd'
import React from 'react'

interface FullSizeLoaderProps {
    backgroundColor?: string
}

const FullSizeLoader: React.FC<FullSizeLoaderProps> = ({ backgroundColor }) => {
    return (
        <Flex align="center" justify="center" style={{ height: '100%', backgroundColor }}>
            <Spin size="large" />
        </Flex>
    )
}

export default FullSizeLoader
