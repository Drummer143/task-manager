import { MenuOutlined } from '@ant-design/icons'
import { Button, Divider, Drawer, Layout } from 'antd'
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'

const DesktopLayout: React.FC = () => {
    const [open, setOpen] = useState(false)

    return (
        <Layout className="h-full">
            <Drawer placement="left" open={open} onClose={() => setOpen(false)}>
                sider
            </Drawer>

            <Layout className="h-full">
                <Layout.Header style={{ paddingLeft: 'var(--ant-padding-md)' }}>
                    <Button icon={<MenuOutlined />} onClick={() => setOpen(true)} />
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
