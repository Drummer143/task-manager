import { Divider, Layout } from 'antd'
import React from 'react'
import { Outlet } from 'react-router-dom'

const DesktopLayout: React.FC = () => {
    return (
        <Layout className="h-full">
            <Layout.Sider collapsible breakpoint="xl">
                sider
            </Layout.Sider>

            <Divider type="vertical" style={{ margin: 0, height: '100%' }} />

            <Layout className="h-full">
                <Layout.Header style={{ paddingLeft: '1rem' }}>header</Layout.Header>

                <Divider style={{ margin: 0 }} />

                <Layout.Content>
                    <Outlet />
                </Layout.Content>
            </Layout>
        </Layout>
    )
}

export default DesktopLayout
