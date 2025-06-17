import React from "react";

import { mergeAttributes, Node, nodeInputRule, NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { minimatch } from "minimatch";

export type ReactNodeRenderer = React.FC<NodeViewProps>;

export interface FileRendererOptions {
	filesRules: Record<
		string,
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			HTMLAttributes?: Record<string, any>;

			render?: ReactNodeRenderer;
		}
	>;
}

/**
 * Matches an image to a ![image](src "title") on input.
 */
export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const defaultNodeImageRenderer: React.FC<NodeViewProps> = props => (
	<NodeViewWrapper {...props.HTMLAttributes} as="img" />
);
export const defaultNodeVideoRenderer: React.FC<NodeViewProps> = props => (
	<NodeViewWrapper>
		<video controls width="100%" preload="metadata">
			<source src={props.node.attrs["src"]} type={props.node.attrs["type"]} />
			Ваш браузер не поддерживает видео.
		</video>
	</NodeViewWrapper>
);
export const defaultNodeFileRenderer: React.FC<NodeViewProps> = props => (
	<NodeViewWrapper {...props.HTMLAttributes} as="a" download>
		{props.node.attrs["title"]}
	</NodeViewWrapper>
);

/**
 * This extension allows you to insert images.
 * @see https://www.tiptap.dev/api/nodes/image
 */
export const FileRenderer = Node.create<FileRendererOptions>({
	name: "file",

	addOptions() {
		return {
			filesRules: {
				// "image/*": {
				// 	HTMLAttributes: {
				// 		class: "is-image"
				// 	},
				// 	render: defaultNodeImageRenderer
				// },
				// "video/*": {
				// 	HTMLAttributes: {
				// 		class: "is-video"
				// 	},
				// 	render: defaultNodeVideoRenderer
				// },
				// "**/**": {
				// 	HTMLAttributes: {
				// 		class: "is-file"
				// 	},
				// 	render: defaultNodeFileRenderer
				// }
			}
		};
	},

	group() {
		return "block";
	},

	draggable: true,

	addAttributes() {
		return {
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
		const ext = "." + node.attrs["src"].split(".").pop();

		const HTMLAttrsForMime =
			Object.entries(this.options.filesRules).find(
				([key]) => (key && mime && minimatch(mime, key)) || (ext && key.includes(ext))
			)?.[1] || {};

		return mime?.startsWith("image/")
			? ["img", mergeAttributes(HTMLAttrsForMime, HTMLAttributes)]
			: mime?.startsWith("video/")
				? ["video", mergeAttributes(HTMLAttrsForMime, HTMLAttributes)]
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
			const ext = "." + props.node.attrs["src"].split(".").pop();

			const optionsForMime =
				mime || ext
					? Object.entries(this.options.filesRules).find(
							([key]) =>
								(key && mime && minimatch(mime, key)) || (ext && key.includes(ext))
						)?.[1] || {}
					: {};

			return ReactNodeViewRenderer(optionsForMime.render || defaultNodeFileRenderer)({
				...props,
				HTMLAttributes: {
					...props.HTMLAttributes,
					...optionsForMime.HTMLAttributes
				}
			});
		};
	}
});

