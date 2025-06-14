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

// const defaultNodeImageRenderer: React.FC<NodeViewProps> = props => (
// 	<NodeViewWrapper {...props.HTMLAttributes} as="img" />
// );
// const defaultNodeVideoRenderer: React.FC<NodeViewProps> = props => (
// 	<NodeViewWrapper {...props.HTMLAttributes} as="video" />
// );
const defaultNodeFileRenderer: React.FC<NodeViewProps> = props => (
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

		const HTMLAttrsForMime =
			Object.entries(this.options.filesRules).find(
				([key]) => mime && key && minimatch(mime, key)
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

			const optionsForMime = mime
				? Object.entries(this.options.filesRules).find(([key]) =>
						minimatch(mime, key)
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

