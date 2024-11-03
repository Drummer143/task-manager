import { Layout } from 'antd'
import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout: React.FC = () => (
    <Layout className="h-full">
        <Outlet />
    </Layout>
)

export default AuthLayout
