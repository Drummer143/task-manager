import { memo } from "react";

import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Button, Flex } from "antd";

import { useStyles } from "./styles";

import { useUploadStatus } from "../../../../app/store/uploads";
import FileUploadProgress from "../../../FileUploadProgress";

const ImageRenderer: React.FC<NodeViewProps> = props => {
	const { styles } = useStyles();
	const fileId = props.node.attrs.id || props.node.attrs.assetId;
	const uploadStatus = useUploadStatus(fileId);

	const hasSrc = !!props.node.attrs.src;

	const handleDeleteSelf = () => {
		if (!props.editor.isEditable) {
			return;
		}

		const pos = props.getPos();

		props.editor
			.chain()
			.focus()
			.deleteRange({ from: pos, to: pos + props.node.nodeSize })
			.run();
	};

	if (uploadStatus?.status.type === "progress" && !hasSrc) {
		return (
			<NodeViewWrapper>
				<FileUploadProgress status={uploadStatus.status.data} />
			</NodeViewWrapper>
		);
	}

	return (
		<NodeViewWrapper>
			<div className={styles.wrapper}>
				<img
					alt={props.node.attrs.title}
					{...props.HTMLAttributes}
					className={styles.image}
				/>

				<Flex className={styles.buttonsContainer} gap="calc(var(--ant-margin-xxs) / 2)">
					<Button
						icon={<DownloadOutlined />}
						type="text"
						target="_blank"
						href={props.node.attrs["src"]}
						download={props.node.attrs["title"]}
					/>

					{props.editor.isEditable && (
						<Button
							type="text"
							danger
							icon={<DeleteOutlined />}
							onClick={handleDeleteSelf}
						/>
					)}
				</Flex>
			</div>
		</NodeViewWrapper>
	);
};

export default ReactNodeViewRenderer(memo(ImageRenderer));

