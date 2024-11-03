import React, { useMemo } from 'react'
import { Avatar, Dropdown, Flex, MenuProps, Spin } from 'antd'
import { useAuthStore } from 'store/auth'
import { UserMenuTrigger } from './styles'
import api from 'api'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

const UserMenu: React.FC = () => {
    const { user, loading, clear } = useAuthStore((state) => state)

    const navigate = useNavigate()

    const { mutateAsync } = useMutation({
        mutationFn: () => api.auth.logout().then(clear),
        onSuccess: () => navigate('/login', { replace: true })
    })

    const menu: MenuProps = useMemo(
        () => ({
            items: [
                {
                    key: 'logout',
                    label: 'Log out',
                    onClick: async () => mutateAsync()
                }
            ]
        }),
        [mutateAsync]
    )

    if (loading) {
        return (
            <Flex style={{ width: '100px' }}>
                <Spin />
            </Flex>
        )
    }

    return (
        <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
            <UserMenuTrigger>
                <p>{user?.username}</p>

                <Avatar src={user?.picture || 'avatar-placeholder-32.jpg'} />
            </UserMenuTrigger>
        </Dropdown>
    )
}

export default UserMenu
