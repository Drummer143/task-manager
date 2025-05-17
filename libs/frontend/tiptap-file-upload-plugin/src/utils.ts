import { Transaction } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import { minimatch } from "minimatch";

import { FileUploadPluginOptions, UploadedFileInfo } from "./types";

export const defaultFileUploadFn = (file: File): UploadedFileInfo => {
	const url = URL.createObjectURL(file);

	return {
		url,
		name: file.name,
		size: file.size,
		type: file.type
	};
};

export const defaultImageUploadFn = async (file: File) =>
	new Promise<UploadedFileInfo>((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = e => {
			const img = new Image();

			img.src = e.target?.result as string;

			img.onload = () => {
				resolve({
					url: e.target?.result as string,
					name: file.name,
					size: file.size,
					type: file.type,
					width: img.width,
					height: img.height
				});
			};
		};

		reader.onerror = e => {
			reject(e);
		};

		reader.readAsDataURL(file);
	});

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

export const uploadFiles = async (
	files: ArrayLike<File>,
	insertPos: number,
	view: EditorView,
	uploadFn: FileUploadPluginOptions["uploadFn"]
): Promise<Transaction> => {
	const tr = view.state.tr;

	(
		await Promise.allSettled(
			Array.from(files).map(file => {
				let fn = Object.entries(uploadFn).find(([type]) => minimatch(file.type, type))?.[1];

				if (!fn) {
					fn = minimatch(file.name, "image/*")
						? defaultImageUploadFn
						: defaultFileUploadFn;
				}

				return fn(file);
			})
		)
	).forEach(uploadedFile => {
		if (uploadedFile.status === "fulfilled") {
			const imageNode = view.state.schema.node("file", {
				src: uploadedFile.value.url,
				href: uploadedFile.value.url,
				alt: uploadedFile.value.name,
				size: uploadedFile.value.size,
				type: uploadedFile.value.type,
				title: uploadedFile.value.name
			});

			tr.insert(insertPos, imageNode);
		}
	});

	return tr;
};

