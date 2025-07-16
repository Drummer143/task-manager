import { useEffect, useMemo, useRef } from "react";

import { Editor } from "@tiptap/core";
import { GetProp, type Menu } from "antd";

type MenuItems = GetProp<typeof Menu, "items">;

export const useContextMenuItems = (editor: Editor | null): MenuItems => {
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const input = document.createElement("input");

		input.type = "file";
		input.hidden = true;
		inputRef.current = input;
		input.addEventListener("change", () => {
			if (input.files) {
				editor?.commands.uploadFile(input.files);
			}
		});

		document.body.appendChild(input);

		return () => {
			input.remove();
		};
	}, [editor]);

	return useMemo<MenuItems>(
		() =>
			editor?.isEditable
				? [
						{
							type: "item",
							label: "Upload file",
							key: "upload-file",
							onClick: () => {
								inputRef.current?.click();
							}
						}
					]
				: [],
		[editor?.isEditable]
	);
};

