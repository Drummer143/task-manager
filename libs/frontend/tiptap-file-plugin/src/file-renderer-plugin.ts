import { mergeAttributes, Node, nodeInputRule, NodeViewRenderer } from "@tiptap/core";
import { minimatch } from "minimatch";

import { defaultFileRenderer } from "./default-renderers";

export interface FileRendererOptions {
	rendererMap: Record<
		string,
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			HTMLAttributes?: Record<string, any>;
			renderer?: NodeViewRenderer;
		}
	>;
}

const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const FileRendererPlugin = Node.create<FileRendererOptions>({
	name: "file",

	addOptions() {
		return {
			rendererMap: {}
		};
	},

	group() {
		return "block";
	},

	draggable: true,

	addAttributes() {
		return {
			id: {
				default: null
			},
			src: {
				default: null
			},
			href: {
				default: null
			},
			alt: {
				default: null
			},
			title: {
				default: null
			},
			width: {
				default: "100%"
			},
			height: {
				default: "auto"
			},
			type: {
				default: null
			},
			size: {
				default: null
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: "img[src]"
			},
			{
				tag: "video[src]"
			},
			{
				tag: "a",
				attrs: {
					href: true,
					download: true
				}
			}
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const mime = node.attrs["type"];
		const ext = node.attrs["src"]?.split(".").pop();
		const id = node.attrs["id"];

		const HTMLAttrsForMime =
			Object.entries(this.options.rendererMap).find(
				([key]) => (key && mime && minimatch(mime, key)) || (ext && key.includes(ext))
			)?.[1] || {};

		const dataIdObj = id ? { id } : {};

		return mime?.startsWith("image/")
			? ["img", mergeAttributes(HTMLAttrsForMime, HTMLAttributes, dataIdObj)]
			: mime?.startsWith("video/")
				? ["video", mergeAttributes(HTMLAttrsForMime, HTMLAttributes, dataIdObj)]
				: [
						"a",
						mergeAttributes(HTMLAttrsForMime, HTMLAttributes, {
							download: true
						}),
						node.attrs["title"]
					];
	},

	addInputRules() {
		return [
			nodeInputRule({
				find: inputRegex,
				type: this.type,
				getAttributes: match => {
					const [, , alt, src, title] = match;

					return { src, alt, title };
				}
			})
		];
	},

	addNodeView() {
		return props => {
			const mime = props.node.attrs["type"];
			const ext = props.node.attrs["src"]?.split(".").pop();
			const id = props.node.attrs["id"];

			const rendererConfig =
				mime || ext
					? Object.entries(this.options.rendererMap).find(
							([key]) =>
								(key && mime && minimatch(mime, key)) || (ext && key.includes(ext))
						)?.[1] || {}
					: {};

			console.log(rendererConfig, mime);

			return (rendererConfig.renderer || defaultFileRenderer)({
				...props,
				HTMLAttributes: {
					...props.HTMLAttributes,
					...rendererConfig.HTMLAttributes,
					"id": id
				}
			});
		};
	}
});

