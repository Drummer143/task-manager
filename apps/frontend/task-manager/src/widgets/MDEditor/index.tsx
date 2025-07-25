import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState
} from "react";

import {
	Editor,
	EditorContent,
	EditorContentProps,
	EditorEvents,
	JSONContent,
	useEditor
} from "@tiptap/react";
import { Dropdown } from "antd";

import { EMPTY_NODE_CLASS, extensions } from "./extensions";
import { useStyles } from "./styles";
import { useContextMenuItems } from "./useContextMenuItems";
import BubbleMenu from "./widgets/BubbleMenu";

interface MDEditorProps
	extends Omit<
		EditorContentProps,
		| "editor"
		| "innerRef"
		| "ref"
		| "onChange"
		| "value"
		| "contentEditable"
		| "children"
		| "placeholder"
	> {
	value?: JSONContent;
	editable?: boolean;

	onChange?: (value: JSONContent) => void;
}

const MDEditor: React.ForwardRefRenderFunction<Editor | null, MDEditorProps> = (
	{ editable = true, value, onChange, className, ...props },
	ref
) => {
	const { styles, cx } = useStyles({
		emptyNodeClass: EMPTY_NODE_CLASS
	});

	const [selectionParams, setSelectionParams] = useState({
		Bold: false,
		Italic: false,
		Strike: false,
		Code: false
	});

	const handleSelectionUpdate = useCallback(
		({ transaction, editor }: EditorEvents["selectionUpdate"]) => {
			if (transaction.selection.empty) {
				return;
			}

			setSelectionParams({
				Bold: editor.isActive("bold"),
				Code: editor.isActive("code"),
				Italic: editor.isActive("italic"),
				Strike: editor.isActive("strike")
			});
		},
		[]
	);

	const editor = useEditor({
		extensions,
		content: value,
		editable,
		onSelectionUpdate: handleSelectionUpdate,
		onUpdate: ({ transaction, editor }) => {
			onChange?.(transaction.doc.toJSON());

			if (!transaction.selection.empty) {
				setSelectionParams({
					Code: editor.isActive("code"),
					Bold: editor.isActive("bold"),
					Italic: editor.isActive("italic"),
					Strike: editor.isActive("strike")
				});
			}
		}
	});

	const ctxMenuItems = useContextMenuItems(editor);

	useImperativeHandle(ref, () => editor as Editor, [editor]);

	const onBubbleMenuItemClick = useCallback(
		(action: "Bold" | "Italic" | "Strike" | "Code") => {
			if (!editor) {
				return;
			}

			let chain = editor.chain().focus();

			chain = chain[`toggle${action}`]();

			chain.run();
		},
		[editor]
	);

	useEffect(() => {
		editor?.setEditable(editable);
	}, [editable, editor]);

	return (
		<>
			<Dropdown menu={{ items: ctxMenuItems }} trigger={["contextMenu"]}>
				<EditorContent
					{...props}
					editor={editor}
					className={cx(styles.editor, className)}
				/>
			</Dropdown>

			<BubbleMenu
				editor={editor}
				selectionParams={selectionParams}
				onItemClick={onBubbleMenuItemClick}
			/>
		</>
	);
};

export default memo(forwardRef(MDEditor));

