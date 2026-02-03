import { memo, useMemo } from "react";

import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Button, Flex } from "antd";

import { useStyles } from "./styles";

import { useAuthStore } from "../../../../app/store/auth";
import { useUploadStatus } from "../../../../app/store/uploads";
import FileUploadProgress from "../../../FileUploadProgress";

const ImageRenderer: React.FC<NodeViewProps> = ({ HTMLAttributes, node, getPos, editor }) => {
	const { styles } = useStyles();
	const fileId = node.attrs.id || node.attrs.assetId;
	const uploadStatus = useUploadStatus(fileId);

	const hasSrc = !!node.attrs.src;

	const handleDeleteSelf = () => {
		if (!editor.isEditable) {
			return;
		}

		const pos = getPos();

		editor
			.chain()
			.focus()
			.deleteRange({ from: pos, to: pos + node.nodeSize })
			.run();
	};

	const token = useAuthStore(state => state.identity.access_token);

	const src = useMemo(() => {
		if (!HTMLAttributes.src) {
			return HTMLAttributes.src;
		}

		const url = new URL(HTMLAttributes.src);

		url.searchParams.set("token", token);

		return url.toString();
	}, [HTMLAttributes.src, token]);

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
					alt={node.attrs.title}
					{...HTMLAttributes}
					src={src}
					className={styles.image}
				/>

				<Flex className={styles.buttonsContainer} gap="calc(var(--ant-margin-xxs) / 2)">
					<Button
						icon={<DownloadOutlined />}
						type="text"
						target="_blank"
						href={src}
						download={node.attrs["title"]}
					/>

					{editor.isEditable && (
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

