import { memo, useMemo } from "react";

import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import VideoPlayer from "@task-manager/video-player";
import { NodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";
import { GetProp } from "antd";

const VideoRenderer: React.FC<NodeViewProps> = ({ HTMLAttributes, editor, getPos, node }) => {
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

	return <VideoPlayer controls src={HTMLAttributes.src} options={menuItems} />;
};

export default ReactNodeViewRenderer(memo(VideoRenderer));

