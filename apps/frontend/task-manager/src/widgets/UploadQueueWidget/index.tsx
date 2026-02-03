import React, { useCallback } from "react";

import {
	ArrowDownOutlined,
	ArrowUpOutlined,
	CloseOutlined,
	LoadingOutlined,
	PauseOutlined,
	ShrinkOutlined
} from "@ant-design/icons";
import { useDisclosure } from "@task-manager/react-utils";
import { Button, Card, Divider, Flex, FloatButton, Progress, Typography } from "antd";
import { createStyles } from "antd-style";

import { UploadItem, useAllUploads } from "../../app/store/uploads";
import { cancelAllUploads, cancelUpload, reorderQueue } from "../../app/worker";
import { uploadStatusLocale } from "../../shared/utils/uploadStatusLocale";

const useStyles = createStyles(({ css }, { open }: { open: boolean }) => ({
	widgetWrapper: css`
		position: fixed;
		bottom: var(--ant-margin-xxl);
		inset-inline-end: var(--ant-margin-lg);
		z-index: calc(var(--ant-z-index-popup-base) + 1);

		width: 400px;

		opacity: ${open ? 1 : 0};
		transform: scale(${open ? 1 : 0});
		transition: all var(--ant-motion-duration-mid) var(--ant-motion-ease-out-circ);
		transform-origin: bottom right;

		${!open && "pointer-events: none"}
	`,
	maxWidth100: css`
		max-width: 100%;

		overflow: hidden;
	`,
	ellipsis: css`
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	`,
	list: css`
		padding: var(--ant-padding-sm);
		max-height: 175px;
		overflow-y: auto;
	`,
	uploadProgressInfoContainer: css`
		display: grid;
		grid-template-columns: max-content 1fr;
		align-items: center;
		gap: var(--ant-padding-sm);
	`
}));

const UploadQueueWidget: React.FC = () => {
	const { open, onClose, onOpen } = useDisclosure(true);

	const uploads = useAllUploads();

	const styles = useStyles({ open }).styles;

	const renderUploadStatusInfo = useCallback(
		(upload: UploadItem) => {
			if (upload.status.type === "error") {
				return <Typography.Text>Upload failed</Typography.Text>;
			}

			switch (upload.status.data.step) {
				case "uploadingFile":
					return (
						<div className={styles.uploadProgressInfoContainer}>
							<Typography.Text>{uploadStatusLocale.uploadingFile}</Typography.Text>

							<Progress
								type="line"
								percent={Math.round(upload.status.data.progress)}
							/>
						</div>
					);
				// case "computingHash":
				// case "initializingTransfer":
				// case "verifyingFile":
				// case "checkingIntegrity":
				// case "queued":
				default:
					return (
						<Typography.Text>
							{uploadStatusLocale[upload.status.data.step]}
						</Typography.Text>
					);
			}
		},
		[styles.uploadProgressInfoContainer]
	);

	if (!uploads.length) {
		return;
	}

	return (
		<>
			{!open && (
				<FloatButton
					icon={<LoadingOutlined />}
					onClick={onOpen}
					badge={{ count: uploads.length }}
				/>
			)}

			<Card
				size="small"
				title={
					<Flex justify="space-between">
						<Typography>Upload Queue</Typography>

						<Flex gap="var(--ant-margin-xxs)">
							<Button
								shape="circle"
								size="small"
								type="text"
								title="Pause all uploads"
								icon={<PauseOutlined />}
							/>
							<Button
								shape="circle"
								size="small"
								type="text"
								title="Cancel all uploads"
								icon={<CloseOutlined />}
								onClick={cancelAllUploads}
							/>
							<Button
								shape="circle"
								size="small"
								type="text"
								title="Hide queue"
								icon={<ShrinkOutlined />}
								onClick={onClose}
							/>
						</Flex>
					</Flex>
				}
				classNames={{ root: styles.widgetWrapper, body: styles.list }}
			>
				{uploads.map((file, i) => (
					<>
						<Flex vertical className={styles.maxWidth100} gap="var(--ant-padding-xxs)">
							<Flex
								justify="space-between"
								className={styles.maxWidth100}
								align="center"
							>
								<Typography.Text className={styles.ellipsis} title={file.fileName}>
									{file.fileName}
								</Typography.Text>

								<Flex gap="var(--ant-margin-xxs)">
									<Button
										icon={<ArrowUpOutlined />}
										size="small"
										type="text"
										title="Move file up"
										disabled={i === 0}
										onClick={() => reorderQueue(file.fileId, i - 1)}
									/>

									<Button
										icon={<ArrowDownOutlined />}
										size="small"
										type="text"
										title="Move file down"
										disabled={i === uploads.length - 1}
										onClick={() => reorderQueue(file.fileId, i + 1)}
									/>

									<Button
										icon={<CloseOutlined />}
										size="small"
										type="text"
										title="Cancel file upload"
										onClick={() => cancelUpload(file.fileId)}
									/>
								</Flex>
							</Flex>

							{renderUploadStatusInfo(file)}
						</Flex>

						{i < uploads.length - 1 && (
							<Divider styles={{ rail: { margin: "var(--ant-margin-xxs) 0" } }} />
						)}
					</>
				))}
			</Card>
		</>
	);
};

export default UploadQueueWidget;

