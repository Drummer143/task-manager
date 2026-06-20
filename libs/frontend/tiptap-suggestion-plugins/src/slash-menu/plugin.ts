import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Suggestion } from "@tiptap/suggestion";

import { getSuggestionConfig } from "./renderMenu";
import { SlashMenuGroup } from "./SlashMenu";

import { isSuggestionOpenHotkey } from "../hotkeys";

const RESET_DISMISSED_META = "slash-command-reset-dismissed";
const ctrlSpacePluginKey = new PluginKey("slash-command-ctrl-space");

export interface SlashCommandsOptions {
	groups: SlashMenuGroup[];
	tippyContainerSelector?: string;
}

export const SlashCommandsExtension = Extension.create<SlashCommandsOptions>({
	name: "slashCommands",

	addOptions() {
		return {
			groups: []
		};
	},

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: ctrlSpacePluginKey,
				props: {
					handleKeyDown(view, event) {
						if (isSuggestionOpenHotkey(event)) {
							view.dispatch(
								view.state.tr.setMeta(RESET_DISMISSED_META, true)
							);
							return true;
						}
						return false;
					}
				}
			}),
			Suggestion({
				editor: this.editor,
				char: "/",
				command: ({ editor, range, props }) => {
					props.command({ editor, range });
				},
				shouldResetDismissed: ({ transaction }) => {
					if (transaction.getMeta(RESET_DISMISSED_META)) return true;
					if (!transaction.docChanged) return false;
					return transaction.steps.some(step => {
						const slice = (step as any).slice;
						if (!slice?.content) return false;
						const inserted = slice.content.textBetween(
							0,
							slice.content.size,
							"\n"
						);
						return inserted.length > 0 && !/^\s+$/.test(inserted);
					});
				},
				...getSuggestionConfig(
					this.options.groups,
					this.options.tippyContainerSelector
				)
			})
		];
	}
});
