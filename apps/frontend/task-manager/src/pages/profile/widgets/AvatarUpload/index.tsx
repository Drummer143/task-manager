import React, { memo, useCallback, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAvatar } from "@task-manager/api";
import { App, Flex } from "antd";
import { Area } from "react-easy-crop";

import FileInput from "../../../../widgets/FileInput";
import ImageCrop from "../../../../widgets/ImageCrop";

interface AvatarUploaderProps {
	avatarUrl?: string;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ avatarUrl }) => {
	const [image, setImage] = useState<File | undefined>(undefined);

	const message = App.useApp().message;

	const queryClient = useQueryClient();

	const { mutateAsync } = useMutation({
		mutationFn: uploadAvatar,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
		onError: error => message.error(error.message ?? "Failed to upload avatar")
	});

	const handleUploadAvatar = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
		event => setImage(event.target.files?.[0]),
		[]
	);

	const handleCropClose = useCallback(() => setImage(undefined), []);

	const handleUpload = useCallback(
		async (area: Area) => {
			if (!image) {
				return;
			}

			mutateAsync({ ...area, file: image });
		},
		[image, mutateAsync]
	);

	return (
		<Flex vertical align="center" gap="1rem">
			{avatarUrl && <img src={avatarUrl} alt="Avatar" width="200" height="200" />}

			<FileInput onChange={handleUploadAvatar} accept=".jpg, .jpeg, .png">
				Update avatar
			</FileInput>

			<ImageCrop image={image} isOpen={!!image} onCancel={handleCropClose} onCropFinish={handleUpload} />
		</Flex>
	);
};

export default memo(AvatarUploader);