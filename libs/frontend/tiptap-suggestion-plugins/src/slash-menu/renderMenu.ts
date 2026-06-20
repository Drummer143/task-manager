import { ReactRenderer } from "@tiptap/react";
import { SuggestionOptions } from "@tiptap/suggestion";
import tippy, { Instance as TippyInstance } from "tippy.js";

import SlashMenu, { SlashMenuGroup, SlashMenuRef } from "./SlashMenu";

export const getSuggestionConfig = (
	configuredGroups: SlashMenuGroup[],
	tippyContainerSelector = "body"
): Omit<SuggestionOptions, "editor"> => ({
	items: ({ query }): SlashMenuGroup[] => {
		if (!query.length) return configuredGroups;

		return configuredGroups
			.map(group => ({
				...group,
				items: group.items.filter(item =>
					item.title.toLowerCase().includes(query.toLowerCase())
				)
			}))
			.filter(group => group.items.length > 0);
	},

	render: () => {
		let component: ReactRenderer<SlashMenuRef>;
		let popup: TippyInstance[];

		return {
			onStart: props => {
				component = new ReactRenderer(SlashMenu, {
					...props,
					props: {
						...props,
						items: configuredGroups
					}
				});

				if (!props.clientRect) return;

				popup = tippy("body", {
					getReferenceClientRect: props.clientRect as () => DOMRect,
					appendTo: () => document.querySelector(tippyContainerSelector) ?? document.body,
					content: component.element,
					showOnCreate: true,
					interactive: true,
					trigger: "manual",
					placement: "bottom-start"
				});
			},

			onUpdate(props) {
				component.updateProps(props);

				if (!props.clientRect) return;

				popup[0].setProps({
					getReferenceClientRect: props.clientRect as () => DOMRect
				});
			},

			onKeyDown(props) {
				return component.ref?.onKeyDown(props) || false;
			},

			onExit() {
				popup?.[0]?.destroy();
				component?.destroy();
			}
		};
	}
});
