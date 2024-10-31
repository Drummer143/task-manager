import React, { useCallback, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import api from 'api'
import FileInput from 'widgets/FileInput'

import ImageCrop from 'widgets/ImageCrop'
import { Area } from 'react-easy-crop'
import { Flex } from 'antd'

interface AvatarUploaderProps {
    avatarUrl?: string
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ avatarUrl }) => {
    const [image, setImage] = useState<File | undefined>(undefined)

    const queryClient = useQueryClient()

    const { mutateAsync } = useMutation({
        mutationFn: api.profile.uploadAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        }
    })

    const handleUploadAvatar = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        (event) => setImage(event.target.files?.[0]),
        []
    )

    const handleCropClose = useCallback(() => setImage(undefined), [])

    const handleUpload = useCallback(
        async (area: Area) => {
            if (!image) {
                return
            }

            mutateAsync({ ...area, file: image })
        },
        [image, mutateAsync]
    )

    return (
        <Flex vertical align="center" gap="1rem">
            {avatarUrl && <img src={avatarUrl} alt="Avatar" width="200" height="200" />}

            <FileInput onChange={handleUploadAvatar} accept=".jpg, .jpeg, .png">
                Update avatar
            </FileInput>

            <ImageCrop
                image={image}
                isOpen={!!image}
                onCancel={handleCropClose}
                onCropFinish={handleUpload}
            />
        </Flex>
    )
}

export default AvatarUploader
