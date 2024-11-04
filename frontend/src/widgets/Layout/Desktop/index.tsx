import { Layout } from 'antd'
import React from 'react'
import { Outlet } from 'react-router-dom'
import UserMenu from './UserMenu'
import * as s from './styles'

const DesktopLayout: React.FC = () => {
    return (
        <Layout className="h-full">
            <Layout.Sider collapsible breakpoint="xl">
                sider
            </Layout.Sider>

            <s.Divider type="vertical" className='h-full' />

            <Layout className="h-full">
                <s.Header>
                    header

                    <UserMenu />
                </s.Header>

                <s.Divider />

                <Layout.Content>
                    <Outlet />
                </Layout.Content>
            </Layout>
        </Layout>
    )
}

export default DesktopLayout
