import { memo, useMemo, useState } from "react";

import {
	DeleteOutlined,
	DownloadOutlined,
	EyeInvisibleOutlined,
	EyeOutlined
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { storageInstance } from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";
import { mergeDeep, NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Button, Flex, Select, Spin } from "antd";
import { AxiosResponse } from "axios";
import oneDarkDefault from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLightDefault from "react-syntax-highlighter/dist/esm/styles/prism/one-light";

import { useStyles } from "./styles";

import { useUploadStatus } from "../../../../app/store/uploads";
import FileUploadProgress from "../../../FileUploadProgress";

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

export function getLanguageFromMime(mimeType: string): string {
	if (!mimeType) return "text";

	// Разбираем строку, например "text/x-elixir" -> ["text", "x-elixir"]
	const parts = mimeType.split("/");
	const subtype = parts[1] || "";

	// 1. Прямые совпадения для application/*
	if (subtype === "json") return "json";
	if (subtype === "typescript") return "typescript";
	if (subtype === "javascript") return "javascript";
	if (subtype === "sql") return "sql";

	// 2. Обработка префикса "x-" (стандарт для нестандартных типов)
	// text/x-elixir -> elixir
	// text/x-rust -> rust
	// text/x-python -> python
	if (subtype.startsWith("x-")) {
		return subtype.replace(/^x-/, "");
	}

	// 3. Fallback для простых типов (text/css -> css, text/html -> html)
	if (subtype === "plain") return "text";

	return subtype;
}

export const SUPPORTED_LANGUAGES = [
	{ label: "Plain Text", value: "text" },
	{ label: "Bash / Shell", value: "bash" },
	{ label: "C", value: "c" },
	{ label: "C++", value: "cpp" },
	{ label: "C#", value: "csharp" },
	{ label: "CSS", value: "css" },
	{ label: "Docker", value: "dockerfile" },
	{ label: "Elixir", value: "elixir" }, // <-- Наш герой
	{ label: "Go", value: "go" },
	{ label: "GraphQL", value: "graphql" },
	{ label: "HTML", value: "html" },
	{ label: "Java", value: "java" },
	{ label: "JavaScript", value: "javascript" },
	{ label: "JSON", value: "json" },
	{ label: "Kotlin", value: "kotlin" },
	{ label: "Less", value: "less" },
	{ label: "Markdown", value: "markdown" },
	{ label: "Makefile", value: "makefile" },
	{ label: "PHP", value: "php" },
	{ label: "Python", value: "python" },
	{ label: "Ruby", value: "ruby" },
	{ label: "Rust", value: "rust" },
	{ label: "SASS / SCSS", value: "scss" },
	{ label: "SQL", value: "sql" },
	{ label: "Svelte", value: "svelte" },
	{ label: "TypeScript", value: "typescript" },
	{ label: "Vue", value: "vue" },
	{ label: "XML", value: "xml" },
	{ label: "YAML", value: "yaml" }
];

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

const FileRender: React.FC<NodeViewProps> = info => {
	const [lang, setLang] = useState("text");
	const [previewVisible, setPreviewVisible] = useState(false);

	const fileId = info.node.attrs.id || info.node.attrs.assetId;
	const uploadStatus = useUploadStatus(fileId);
	const hasSrc = !!info.node.attrs.src || !!info.node.attrs.href;

	const {
		data,
		isPending,
		mutateAsync: getFile
	} = useMutation({
		mutationFn: async () => {
			let response: AxiosResponse | undefined;

			if (info.node.attrs["src"]) {
				response = await storageInstance.get(`/files/${info.node.attrs["id"]}`, {
					responseType: "text"
				});
			} else if (info.node.attrs["href"]) {
				response = await storageInstance.get(`/files/${info.node.attrs["id"]}`, {
					responseType: "text"
				});
			} else if (info.node.attrs["data-id"]) {
				response = await storageInstance.get(`/files/${info.node.attrs["id"]}`, {
					responseType: "text"
				});
			}

			if (!response) {
				throw new Error("Unprocessable file");
			}

			setLang(
				data?.headers["Content-Type"]
					? getLanguageFromMime(data.headers["Content-Type"].toString())
					: "text"
			);

			return response;
		}
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

	const link = useMemo(() => {
		if (info.node.attrs["href"]) {
			return info.node.attrs["href"];
		} else if (info.node.attrs["src"]) {
			return info.node.attrs["src"];
		} else if (info.node.attrs["id"]) {
			return `${storageInstance.defaults.baseURL}/files/${info.node.attrs["id"]}`;
		}
	}, [info.node.attrs]);

	if (uploadStatus?.status.type === "progress" && !hasSrc) {
		return (
			<NodeViewWrapper as="div">
				<FileUploadProgress status={uploadStatus.status.data} />
			</NodeViewWrapper>
		);
	}

	return (
		<NodeViewWrapper as="div">
			<Flex className={styles.wrapper} justify="space-between" align="center">
				<a
					href={link}
					target="_blank"
					download={info.node.attrs["title"]}
					rel="noopener noreferrer"
				>
					{info.node.attrs["title"]}
				</a>

				<Flex gap="var(--ant-margin-xs)">
					<Select
						showSearch
						options={SUPPORTED_LANGUAGES}
						onChange={setLang}
						value={lang}
						size="small"
						variant="borderless"
					/>

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
						language={lang}
						style={theme.appearance === "dark" ? oneDark : oneLight}
					>
						{data?.data}
					</SyntaxHighlighter>
				)
			) : null}
		</NodeViewWrapper>
	);
};

export default ReactNodeViewRenderer(memo(FileRender));

