import { memo, useState } from "react";

import {
	DeleteOutlined,
	DownloadOutlined,
	EyeInvisibleOutlined,
	EyeOutlined
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { lazySuspense } from "@task-manager/react-utils";
import { ReactNodeRenderer } from "@task-manager/tiptap-plugin-file-renderer";
import { NodeViewWrapper } from "@tiptap/react";
import { Button, Flex, Spin } from "antd";
import axios from "axios";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useStyles } from "./styles";

const SyntaxHighlighter = lazySuspense(
	() => import("react-syntax-highlighter").then(d => ({ default: d.PrismAsyncLight })),
	<Flex
		justify="center"
		align="center"
		style={{
			padding: "var(--ant-padding)"
		}}
	>
		<Spin />
	</Flex>
);

const extToLang: Record<string, string> = {
	js: "javascript",
	ts: "typescript",
	jsx: "javascript",
	tsx: "typescript",
	json: "json",
	css: "css",
	html: "html",
	xml: "xml"
};

const FileRender: ReactNodeRenderer = info => {
	const [previewVisible, setPreviewVisible] = useState(false);

	const { styles, theme } = useStyles();

	const {
		data,
		isPending,
		mutateAsync: getFile
	} = useMutation({
		mutationFn: () =>
			axios.get(info.node.attrs["src"], {
				responseType: "text"
			})
	});

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
			<Flex
				className={styles.wrapper}
				justify="space-between"
				align="center"
				style={{
					background:
						!isPending && previewVisible
							? theme.appearance === "dark"
								? oneDark['code[class*="language-"]'].background
								: oneLight['code[class*="language-"]'].background
							: undefined
				}}
			>
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
						title="Download file"
						href={info.node.attrs["src"]}
						download={info.node.attrs["title"]}
					/>

					<Button
						size="small"
						icon={previewVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
						type="text"
						title={previewVisible ? "Hide preview" : "Show preview"}
						onClick={() => {
							!data && getFile();
							setPreviewVisible(!previewVisible);
						}}
					/>

					{info.editor.isEditable && (
						<Button
							size="small"
							type="text"
							danger
							title="Delete file"
							icon={<DeleteOutlined />}
							onClick={handleDeleteSelf}
						/>
					)}
				</Flex>
			</Flex>

			{previewVisible ? (
				isPending ? (
					<Flex
						justify="center"
						align="center"
						style={{
							background:
								theme.appearance === "dark"
									? oneDark['code[class*="language-"]'].background
									: oneLight['code[class*="language-"]'].background,
							padding: "var(--ant-padding)"
						}}
					>
						<Spin />
					</Flex>
				) : (
					<SyntaxHighlighter
						customStyle={{
							marginTop: 0,
							borderTopLeftRadius: 0,
							borderTopRightRadius: 0
						}}
						language={extToLang[info.node.attrs["src"].split(".").pop() || ""]}
						style={theme.appearance === "dark" ? oneDark : oneLight}
					>
						{data?.data}
					</SyntaxHighlighter>
				)
			) : null}
		</NodeViewWrapper>
	);
};

export default memo(FileRender);

