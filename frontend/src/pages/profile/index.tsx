import React from 'react'

import { useQuery } from '@tanstack/react-query'
import { Alert, Spin } from 'antd'

import api from '../../app/api'
import EmailForm from './widgets/EmailForm'
import UserInfoForm from './widgets/UserInfoForm'
import AvatarInput from './widgets/AvatarUpload'
import { FormsContainer, StyledFlex } from './styles'

const Profile: React.FC = () => {
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
        <StyledFlex gap="2rem">
            <FormsContainer>
                <UserInfoForm username={data.username} />
                <EmailForm email={data.email} />
            </FormsContainer>

            <AvatarInput avatarUrl={data.picture} />
        </StyledFlex>
    )
}

export default Profile
