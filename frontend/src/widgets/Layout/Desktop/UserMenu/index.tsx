import React from 'react'
import { Dropdown, Flex, Spin } from 'antd'
import { useAuthStore } from 'store/auth'
import { useUserMenuItems } from 'widgets/Layout/useUserMenuItems'
import UserMenuInfo from 'widgets/Layout/UserMenuInfo'

const UserMenu: React.FC = () => {
    const { user, loading } = useAuthStore((state) => state)

    const menu = useUserMenuItems()

    if (loading) {
        return (
            <Flex style={{ width: '100px' }}>
                <Spin />
            </Flex>
        )
    }

    return (
        <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
            <UserMenuInfo username={user?.username} picture={user?.picture} />
        </Dropdown>
    )
}

export default UserMenu
