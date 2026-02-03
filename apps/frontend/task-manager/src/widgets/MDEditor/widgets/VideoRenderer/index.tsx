import { memo, useMemo } from "react";

import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import VideoPlayer from "@task-manager/video-player";
import { NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { GetProp } from "antd";

import { useAuthStore } from "../../../../app/store/auth";
import { useUploadStatus } from "../../../../app/store/uploads";
import FileUploadProgress from "../../../FileUploadProgress";

const VideoRenderer: React.FC<NodeViewProps> = ({ HTMLAttributes, editor, getPos, node }) => {
	const fileId = node.attrs.id || node.attrs.assetId;
	const uploadStatus = useUploadStatus(fileId);
	const hasSrc = !!HTMLAttributes.src;

	const menuItems = useMemo<GetProp<typeof VideoPlayer, "options">>(() => {
		const options: GetProp<typeof VideoPlayer, "options"> = [
			{
				key: "download",
				label: "Download",
				icon: <DownloadOutlined />,
				onClick: async () => {
					try {
						const a = document.createElement("a");

						a.href = HTMLAttributes.src;
						a.download = HTMLAttributes.src.split("/").pop() || "video.mp4";
						a.click();
					} catch (error) {
						console.error("Error downloading video:", error);
					}
				}
			}
		];

		if (editor.isEditable) {
			options.push({
				key: "delete",
				label: "Delete",
				icon: <DeleteOutlined />,
				onClick: () => {
					if (!editor.isEditable) {
						return;
					}

					const pos = getPos();

					editor
						.chain()
						.focus()
						.deleteRange({ from: pos, to: pos + node.nodeSize })
						.run();
				}
			});
		}

		return options;
	}, [HTMLAttributes.src, editor.isEditable, getPos, node.nodeSize]);

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

	return <VideoPlayer controls src={src} options={menuItems} />;
};

export default ReactNodeViewRenderer(memo(VideoRenderer));

