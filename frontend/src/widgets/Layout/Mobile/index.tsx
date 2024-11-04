import { MenuOutlined } from '@ant-design/icons'
import { Button, Divider, Layout } from 'antd'
import React from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import UserMenu from './UserMenu'
import { useDisclosure } from 'shared/hooks'
import MobileDrawer from 'widgets/MobileDrawer'

const MainDrawer = styled(MobileDrawer)`
    .ant-drawer-body {
        padding: var(--ant-padding-lg);

        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
`

const DesktopLayout: React.FC = () => {
    const { open, onOpen, onClose } = useDisclosure()

    return (
        <Layout className="h-full">
            <MainDrawer open={open} onClose={onClose}>
                nav
                <UserMenu />
            </MainDrawer>

            <Layout className="h-full">
                <Layout.Header style={{ paddingLeft: 'var(--ant-padding-md)' }}>
                    <Button icon={<MenuOutlined />} onClick={onOpen} />
                    header
                </Layout.Header>

                <Divider style={{ margin: 0 }} />

                <Layout.Content>
                    <Outlet />
                </Layout.Content>
            </Layout>
        </Layout>
    )
}

export default DesktopLayout
