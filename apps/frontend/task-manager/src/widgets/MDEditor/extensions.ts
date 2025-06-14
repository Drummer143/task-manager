import { uploadFile } from "@task-manager/api";
import { FileUploadPlugin } from "@task-manager/tiptap-file-upload-plugin";
import { FileRenderer as FileRendererPlugin } from "@task-manager/tiptap-plugin-file-renderer";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

import FileRenderer from "./widgets/FileRenderer";
import ImageRenderer from "./widgets/ImageRenderer";

export const EMPTY_NODE_CLASS = "is-empty";

export const extensions = [
	StarterKit.configure({
		codeBlock: false
	}),
	FileUploadPlugin.configure({
		uploadFn: {
			"**/**": async file => {
				const { link } = await uploadFile({ file });

				console.log(file);

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
		filesRules: {
			".js,.ts,.jsx,.tsx,.json,.css,.html,.xml,.js,.ts,.jsx,.tsx,.json,.css,.html,.xml": {
				render: FileRenderer
			},
			"image/*": {
				render: ImageRenderer
			},
			"**/**": {
				render: FileRenderer
			}
		}
	}),
	Placeholder.configure({
		emptyNodeClass: EMPTY_NODE_CLASS,
		showOnlyWhenEditable: false,
		placeholder: placeholderProps => {
			if (placeholderProps.editor.isEditable) {
				return "Type something...";
			}

			return "No content";
		}
	})
];

