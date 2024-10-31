import React from 'react'

import { useQuery } from '@tanstack/react-query'
import { Alert, Flex, Spin } from 'antd'

import api from '../../app/api'
import EmailForm from './widgets/EmailForm'
import UserInfoForm from './widgets/UserInfoForm'
import AvatarInput from './widgets/AvatarUpload'
import { useStyles } from './styles'

const Profile: React.FC = () => {
    const { styles } = useStyles()

    const { data, isLoading, error } = useQuery({
        queryFn: api.profile.get,
        queryKey: ['profile']
    })

    if (error) {
        return <Alert description={error.message} type="error" message="Error" />
    }

    if (isLoading || !data) {
        return <Spin />
    }

    return (
        <Flex className={styles.wrapper} gap="2rem">
            <div className={styles.formsContainer}>
                <UserInfoForm name={data.name} nickname={data.nickname} username={data.username} />
                <EmailForm email={data.email} />
            </div>

            <AvatarInput avatarUrl={data.picture} />
        </Flex>
    )
}

export default Profile
