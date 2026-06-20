import React from "react";

import { BoldOutlined, ItalicOutlined } from "@ant-design/icons";
import { FileRendererPlugin, FileUploadPlugin } from "@task-manager/tiptap-file-plugin";
import { SlashCommandsExtension } from "@task-manager/tiptap-slash-menu";
import { type Extension, type Node } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { v4 as uuidV4 } from "uuid";

import FileRenderer from "./widgets/FileRenderer";
import ImageRenderer from "./widgets/ImageRenderer";
import VideoRenderer from "./widgets/VideoRenderer";

import { userManager } from "../../app/userManager";
import { initWorker, uploadFile } from "../../app/worker";

export const EMPTY_NODE_CLASS = "is-empty";

export const getExtensions = (
	getFileUploadToken: (file: File, assetId: string) => Promise<string>
) => {
	const extensions: (Extension | Node)[] = [
		StarterKit.configure({
			codeBlock: false
		}),
		FileUploadPlugin.configure({
			uploadFn: {
				"**/**": async file => {
					const assetId = uuidV4();

					const uploadToken = await getFileUploadToken(file, assetId);

					const accessToken = (await userManager.getUser())?.access_token;

					initWorker(accessToken);

					uploadFile(assetId, file.name, file.size, uploadToken, file);

					return {
						id: assetId,
						name: file.name,
						size: file.size,
						type: file.type
					};
				}
			}
		}),
		FileRendererPlugin.configure({
			rendererMap: {
				"text/*": {
					renderer: FileRenderer
				},
				"image/*": {
					renderer: ImageRenderer
				},
				"video/*": {
					renderer: VideoRenderer
				}
			}
		}),
		Placeholder.configure({
			emptyNodeClass: EMPTY_NODE_CLASS,
			showOnlyWhenEditable: false,
			showOnlyCurrent: true,
			placeholder: placeholderProps => {
				if (placeholderProps.editor.isEditable) {
					return "Type something...";
				}

				return "No content";
			}
		}),
		SlashCommandsExtension.configure({
			tippyContainerSelector: ".ant-app",
			groups: [
				{
					title: "Format",
					items: [
						{
							key: "heading-1",
							title: "Heading 1",
							icon: React.createElement("span", { style: { fontWeight: 700, fontSize: "0.72em" } }, "H1"),
							onClick: ({ editor, range }) => {
								editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
							}
						},
						{
							key: "heading-2",
							title: "Heading 2",
							icon: React.createElement("span", { style: { fontWeight: 700, fontSize: "0.72em" } }, "H2"),
							onClick: ({ editor, range }) => {
								editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
							}
						},
						{
							key: "heading-3",
							title: "Heading 3",
							icon: React.createElement("span", { style: { fontWeight: 700, fontSize: "0.72em" } }, "H3"),
							onClick: ({ editor, range }) => {
								editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
							}
						},
						{
							key: "heading-4",
							title: "Heading 4",
							icon: React.createElement("span", { style: { fontWeight: 700, fontSize: "0.72em" } }, "H4"),
							onClick: ({ editor, range }) => {
								editor.chain().focus().deleteRange(range).setNode("heading", { level: 4 }).run();
							}
						},
						{
							key: "heading-5",
							title: "Heading 5",
							icon: React.createElement("span", { style: { fontWeight: 700, fontSize: "0.72em" } }, "H5"),
							onClick: ({ editor, range }) => {
								editor.chain().focus().deleteRange(range).setNode("heading", { level: 5 }).run();
							}
						},
						{
							key: "heading-6",
							title: "Heading 6",
							icon: React.createElement("span", { style: { fontWeight: 700, fontSize: "0.72em" } }, "H6"),
							onClick: ({ editor, range }) => {
								editor.chain().focus().deleteRange(range).setNode("heading", { level: 6 }).run();
							}
						}
					]
				},
				{
					title: "Marks",
					items: [
						{
							key: "bold",
							title: "Bold",
							icon: React.createElement(BoldOutlined),
							onClick: ({ editor, range }) => {
								editor.chain().focus().deleteRange(range).setMark("bold").run();
							}
						},
						{
							key: "italic",
							title: "Italic",
							icon: React.createElement(ItalicOutlined),
							onClick: ({ editor, range }) => {
								editor.chain().focus().deleteRange(range).setMark("italic").run();
							}
						}
					]
				}
			]
		})
	];

	return extensions;
};

