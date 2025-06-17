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
import { mergeDeep, NodeViewWrapper } from "@tiptap/react";
import { Button, Flex, Spin } from "antd";
import axios from "axios";
import oneDarkDefault from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLightDefault from "react-syntax-highlighter/dist/esm/styles/prism/one-light";

import { useStyles } from "./styles";

const SyntaxHighlighter = lazySuspense(
	() => import("react-syntax-highlighter/dist/esm/prism-async-light"),
	<Flex
		justify="center"
		align="center"
		style={{
			padding: "var(--ant-padding)",
			background: "var(--ant-color-bg-container)"
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

const antdStyle: typeof oneDarkDefault = {
	'pre[class*="language-"]': {
		background: "var(--ant-color-bg-container)"
	},
	'code[class*="language-"]': {
		background: "var(--ant-color-bg-container)"
	}
};

const oneDark = mergeDeep(oneDarkDefault, antdStyle);
const oneLight = mergeDeep(oneLightDefault, antdStyle);

const FileRender: ReactNodeRenderer = info => {
	const [previewVisible, setPreviewVisible] = useState(false);

	// console.debug("info.HTMLAttributes", info.HTMLAttributes);

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

	const { styles, theme } = useStyles({ opened: previewVisible });

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
						language={extToLang[info.node.attrs["src"].split(".").pop()] ?? "plaintext"}
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

