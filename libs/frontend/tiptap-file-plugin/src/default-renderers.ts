import { NodeViewRenderer } from "@tiptap/core";

const createRendererFromHTMLElement = (element: HTMLElement): ReturnType<NodeViewRenderer> => {
	const wrapper = document.createElement("p");

	wrapper.appendChild(element);

	return {
		dom: wrapper
	};
};

export const defaultImageRenderer: NodeViewRenderer = props => {
	const img = document.createElement("img");

	img.src = props.node.attrs["href"] || props.node.attrs["src"];
	img.alt = props.node.attrs["alt"];
	img.title = props.node.attrs["title"];
	img.style.width = props.node.attrs["width"];
	img.style.height = props.node.attrs["height"];

	return createRendererFromHTMLElement(img);
};

export const defaultVideoRenderer: NodeViewRenderer = props => {
	const video = document.createElement("video");

	video.src = props.node.attrs["href"] || props.node.attrs["src"];
	video.controls = true;
	video.style.width = props.node.attrs["width"];
	video.style.height = props.node.attrs["height"];

	return createRendererFromHTMLElement(video);
};

export const defaultAudioRenderer: NodeViewRenderer = props => {
	const audio = document.createElement("audio");

	audio.src = props.node.attrs["href"] || props.node.attrs["src"];
	audio.controls = true;

	return createRendererFromHTMLElement(audio);
};

export const defaultFileRenderer: NodeViewRenderer = props => {
	const link = document.createElement("a");

	link.href = props.node.attrs["href"] || props.node.attrs["src"];
	link.download = props.node.attrs["title"] || "File";
	link.innerText = props.node.attrs["title"] || "File";

	return createRendererFromHTMLElement(link);
};
