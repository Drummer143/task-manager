import React, { memo, useCallback, useState } from "react";

import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAvatar, uploadAvatar } from "@task-manager/api/main";
import { User, Workspace } from "@task-manager/api/main/schemas";
import { App, Button, Flex, Image } from "antd";
import { createStyles } from "antd-style";
import { Area } from "react-easy-crop";

import { useAuthStore } from "../../../../app/store/auth";
import { queryKeys } from "../../../../shared/queryKeys";
import { buildStorageUrl } from "../../../../shared/utils/buildStorageUrl";
import FileInput from "../../../../widgets/FileInput";
import ImageCrop from "../../../../widgets/ImageCrop";

const useStyles = createStyles(({ css }) => ({
	deleteIconWrapper: css`
		padding: var(--ant-padding-sm);

		cursor: pointer;
		font-size: 18px;
		color: var(--ant-color-error);
		transition: color var(--ant-motion-duration-mid);

		&:hover {
			color: var(--ant-red-9);
		}

		&:active {
			color: var(--ant-red-8);
		}

		&:focus,
		&:focus-within {
			outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border);
			outline-offset: 1px;
			transition:
				outline-offset 0s,
				outline 0s;
		}
	`,
	imageWrapper: css`
		position: relative;

		width: 200px;
		height: 200px;
	`,
	image: css`
		width: 100%;
		height: 100%;
	`,
	deleteIcon: css`
		position: absolute;
		top: var(--ant-padding-xs);
		right: var(--ant-padding-xs);
		z-index: 10001;
	`
}));

interface AvatarUploaderProps {
	avatarUrl?: string | null;
	isAvatarDefault?: boolean;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ avatarUrl, isAvatarDefault }) => {
	const [image, setImage] = useState<File | undefined>(undefined);

	const { message, modal } = App.useApp();

	const token = useAuthStore(state => state.identity.access_token);

	const queryClient = useQueryClient();

	const styles = useStyles().styles;

	const hydrateProfile = useCallback(
		(user: User) => {
			queryClient.setQueryData(
				queryKeys.profile.root(),
				(oldUser: User & { workspace: Workspace }) => ({
					...user,
					workspace: oldUser?.workspace
				})
			);

			setImage(undefined);
		},
		[queryClient]
	);

	const { mutateAsync: uploadAvatarMutation, isPending: isAvatarUploadPending } = useMutation({
		mutationFn: uploadAvatar,
		onSuccess: hydrateProfile,
		onError: error => message.error(error.message ?? "Failed to upload avatar")
	});

	const { mutateAsync: deleteAvatarMutation } = useMutation({
		mutationFn: deleteAvatar,
		onSuccess: hydrateProfile,
		onError: error => message.error(error.message ?? "Failed to delete avatar")
	});

	const handleUploadAvatar = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
		event => setImage(event.target.files?.[0]),
		[]
	);

	const handleDeleteClick = useCallback(() => {
		if (isAvatarDefault) {
			return;
		}
		modal.confirm({
			title: "Delete avatar",
			content: "Are you sure you want to delete your avatar?",
			onOk: deleteAvatarMutation,
			mask: {
				blur: false
			}
		});
	}, [deleteAvatarMutation, isAvatarDefault, modal]);

	const handleCropClose = useCallback(() => setImage(undefined), []);

	const handleUpload = useCallback(
		async (area: Area) => {
			if (!image) {
				return;
			}

			await uploadAvatarMutation({
				file: image,
				x: area.x,
				y: area.y,
				width: area.width,
				height: area.height
			});
		},
		[image, uploadAvatarMutation]
	);

	return (
		<Flex vertical align="center" gap="1rem">
			{avatarUrl && (
				<div className={styles.imageWrapper}>
					<Image
						data-test-id="user-menu-top-right-info-avatar"
						className={styles.image}
						src={buildStorageUrl(avatarUrl, token)}
						preview={false}
						alt="Avatar"
						width="200px"
						height="200px"
					/>
				</div>
			)}

			<FileInput onChange={handleUploadAvatar} accept=".jpg, .jpeg, .png">
				Update avatar
			</FileInput>

			{!isAvatarDefault && (
				<Button danger icon={<DeleteOutlined />} onClick={handleDeleteClick}>
					Delete avatar
				</Button>
			)}

			<ImageCrop
				image={image}
				isOpen={!!image}
				confirmLoading={isAvatarUploadPending}
				onCancel={handleCropClose}
				onCropFinish={handleUpload}
			/>
		</Flex>
	);
};

export default memo(AvatarUploader);

