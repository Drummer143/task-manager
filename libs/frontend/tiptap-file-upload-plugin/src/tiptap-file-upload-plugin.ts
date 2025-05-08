import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

import { FileUploadPluginOptions } from "./types";
import { defaultUploadFn, getInsertPos, uploadFiles, validateFile } from "./utils";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		fileUpload: {
			uploadFile: (
				files: ArrayLike<File>,
				throwOnInvalidFiles?: boolean,
				insertPos?: number
			) => ReturnType;
		};
	}
}

export const FileUploadPlugin = Extension.create<FileUploadPluginOptions>({
	name: "file-upload",

	addOptions() {
		return {
			uploadFn: defaultUploadFn,
			accept: "**",
			maxFileSize: 0
		};
	},

	addCommands() {
		return {
			uploadFile: (files, throwOnInvalidFiles, startPos) => () => {
				const validFiles = Array.from(files).filter(file => {
					const isValid = validateFile(file, this.options);

					if (!isValid && throwOnInvalidFiles) {
						throw new Error("Invalid files");
					}

					return isValid;
				});

				if (!startPos) {
					startPos = this.editor.state.selection.head;
				}

				const insertPos = getInsertPos(startPos, this.editor.view);

				const tr = uploadFiles(
					validFiles,
					insertPos,
					this.editor.view,
					this.options.uploadFn
				);

				this.editor.view.dispatch(tr);

				return true;
			}
		};
	},

	addProseMirrorPlugins() {
		return [
			new Plugin({
				props: {
					handleDrop: (view, event) => {
						// if (!view.state.schema.nodes["image"]) return false;

						const files = Array.from(event.dataTransfer?.files ?? []).filter(file =>
							validateFile(file, this.options)
						);

						if (!files?.length) return false;

						const coords = { left: event.clientX, top: event.clientY };
						const pos = view.posAtCoords(coords);

						if (!pos) return false;

						event.preventDefault();
						event.stopPropagation();

						const insertPos = getInsertPos(pos.pos, view);

						const tr = uploadFiles(files, insertPos, view, this.options.uploadFn);

						view.dispatch(tr);

						return true;
					},
					handlePaste: (view, event) => {
						// if (!view.state.schema.nodes["image"]) return false;

						const clipboardData = event.clipboardData;

						const files = Array.from(clipboardData?.items ?? [])
							.filter(item => item.kind === "file")
							.map(item => item.getAsFile())
							.filter(
								(file): file is File =>
									file !== null && validateFile(file, this.options)
							);

						if (files.length === 0) return false;

						const pos = view.state.selection.head;

						if (pos === undefined) return false;

						event.preventDefault();
						event.stopPropagation();

						const insertPos = getInsertPos(pos, view);

						const tr = uploadFiles(files, insertPos, view, this.options.uploadFn);

						view.dispatch(tr);

						return true;
					}
				}
			})
		];
	}
});

