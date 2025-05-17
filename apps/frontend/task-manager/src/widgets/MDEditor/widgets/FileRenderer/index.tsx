import { memo } from "react";

import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { ReactNodeRenderer } from "@task-manager/tiptap-plugin-file-renderer";
import { NodeViewWrapper } from "@tiptap/react";
import { Button, Flex } from "antd";

import { useStyles } from "./styles";

const FileRender: ReactNodeRenderer = info => {
	const { styles } = useStyles();

	const handleDeleteSelf = () => {
		if (!info.editor.isEditable) {
			return;
		}

		const pos = info.getPos();

		info.editor
			.chain()
			.focus()
			.deleteRange({ from: pos, to: pos + info.node.nodeSize })
			.run();
	};

	return (
		<NodeViewWrapper as="div">
			<Flex className={styles.wrapper} justify="space-between" align="center">
				<a
					href={info.node.attrs["src"]}
					target="_blank"
					download={info.node.attrs["title"]}
					rel="noopener noreferrer"
				>
					{info.node.attrs["title"]}
				</a>

				<Flex className={styles.buttonsContainer} gap="var(--ant-margin-xs)">
					<Button
						size="small"
						icon={<DownloadOutlined />}
						type="text"
						target="_blank"
						href={info.node.attrs["src"]}
						download={info.node.attrs["title"]}
					/>

					{info.editor.isEditable && (
						<Button
							size="small"
							type="text"
							danger
							icon={<DeleteOutlined />}
							onClick={handleDeleteSelf}
						/>
					)}
				</Flex>
			</Flex>
		</NodeViewWrapper>
	);
};

export default memo(FileRender);

