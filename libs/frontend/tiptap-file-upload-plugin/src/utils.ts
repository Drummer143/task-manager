import { Transaction } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import { minimatch } from "minimatch";

import { FileUploadPluginOptions, UploadFn } from "./types";

export const defaultUploadFn = (file: File) => {
	const url = URL.createObjectURL(file);

	return {
		url,
		name: file.name,
		size: file.size,
		type: file.type
	};
};

export const getInsertPos = (pos: number, view: EditorView) => {
	const $pos = view.state.doc.resolve(pos);

	const node = $pos.node(1);
	const nodePos = $pos.before(1);

	return nodePos + node.nodeSize;
};

export const validateFile = (file: File, options: FileUploadPluginOptions) => {
	if (!minimatch(file.name, options.accept)) {
		options.onWrongFileFormat?.(file);

		return false;
	}

	if (options.maxFileSize !== 0 && file.size > options.maxFileSize) {
		options.onFileSizeExceeded?.(file);

		return false;
	}

	return true;
};

export const uploadFiles = (
	files: ArrayLike<File>,
	insertPos: number,
	view: EditorView,
	uploadFn: UploadFn
): Transaction => {
	const tr = view.state.tr;

	Array.from(files)
		.map(file => {
			return uploadFn(file);
		})
		.forEach(uploadedFile => {
			const imageNode = view.state.schema.node("file", {
				src: uploadedFile.url,
				href: uploadedFile.url,
				alt: uploadedFile.name,
				size: uploadedFile.size,
				type: uploadedFile.type,
				title: uploadedFile.name
			});

			tr.insert(insertPos, imageNode);
		});

	return tr;
};

