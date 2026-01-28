import { uploadFile } from "@task-manager/api";
import { FileRendererPlugin, FileUploadPlugin } from "@task-manager/tiptap-file-plugin";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

import FileRenderer from "./widgets/FileRenderer";
import ImageRenderer from "./widgets/ImageRenderer";
import VideoRenderer from "./widgets/VideoRenderer";

export const EMPTY_NODE_CLASS = "is-empty";

export const extensions = [
	StarterKit.configure({
		codeBlock: false
	}),
	FileUploadPlugin.configure({
		uploadFn: {
			"**/**": async file => {
				const { link } = await uploadFile({ body: { file } });

				return {
					name: file.name,
					url: link,
					size: file.size,
					type: file.type
				};
			}
		}
	}),
	FileRendererPlugin.configure({
		rendererMap: {
			".js,.ts,.jsx,.tsx,.json,.css,.html,.xml": {
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

