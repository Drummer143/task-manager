import React from "react";

import { UploadFileProgressEvent } from "@task-manager/file-transfer-worker";
import { Flex, Progress, Typography } from "antd";
import { createStyles } from "antd-style";

interface FileUploadProgressProps {
	status: UploadFileProgressEvent["data"];
}

const useStyles = createStyles(({ css }) => ({
	container: css`
		background-color: var(--ant-layout-sider-bg);

        padding: var(--ant-padding-sm) var(--ant-padding-md);

        border: var(--ant-line-width) solid var(--ant-color-split);
	`
}));

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({ status }) => {
	const styles = useStyles().styles;

	const jsx = (() => {
		switch (status.step) {
			case "computingHash":
				return <Typography.Text>Computing hash</Typography.Text>;
			case "initializingTransfer":
				return <Typography.Text>Initializing transfer</Typography.Text>;
			case "verifyingFile":
				return <Typography.Text>Verifying file</Typography.Text>;
			case "checkingIntegrity":
				return <Typography.Text>Checking integrity</Typography.Text>;
			case "queued":
				return <Typography.Text>Queued</Typography.Text>;
			case "uploadingFile":
				return (
					<Flex align="center" gap="var(--ant-padding-xs)">
						<Progress
							size={14}
							percent={status.progress}
							type="circle"
							railColor="#e6f4ff"
							strokeWidth={20}
						/>
						<Typography.Text>Uploading file</Typography.Text>
					</Flex>
				);
		}
	})();

	return <div className={styles.container}>{jsx}</div>;
};

export default FileUploadProgress;

