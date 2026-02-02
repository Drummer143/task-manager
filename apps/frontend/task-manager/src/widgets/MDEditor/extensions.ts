import { FileRendererPlugin, FileUploadPlugin } from "@task-manager/tiptap-file-plugin";
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
		})
	];

	return extensions;
};

