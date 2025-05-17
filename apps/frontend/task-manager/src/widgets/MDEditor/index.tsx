import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState
} from "react";

import { uploadAvatar, uploadFile } from "@task-manager/api";
import { FileUploadPlugin } from "@task-manager/tiptap-file-upload-plugin";
import { FileRenderer as FileRendererPlugin } from "@task-manager/tiptap-plugin-file-renderer";
import Placeholder from "@tiptap/extension-placeholder";
import {
	Editor,
	EditorContent,
	EditorContentProps,
	EditorEvents,
	JSONContent,
	useEditor
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useStyles } from "./styles";
import BubbleMenu from "./widgets/BubbleMenu";
import FileRenderer from "./widgets/FileRenderer";
import ImageRender from "./widgets/ImageRender";

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

const EMPTY_NODE_CLASS = "is-empty";

const extensions = [
	StarterKit,
	FileUploadPlugin.configure({
		uploadFn: {
			"image/*": async file => {
				const { link } = await uploadFile({ file });

				return {
					name: file.name,
					url: link,
					size: file.size,
					type: file.type
				};
			}
		}
	}),
	FileRendererPlugin.configure({
		filesRules: {
			"image/*": {
				render: ImageRender
			},
			"video/*": {},
			"!image/*": {
				render: FileRenderer
			}
		}
	}),
	Placeholder.configure({
		emptyNodeClass: EMPTY_NODE_CLASS,
		showOnlyWhenEditable: false,
		placeholder: placeholderProps => {
			if (placeholderProps.editor.isEditable) {
				return "Type something...";
			}

			return "No content";
		}
	})
];

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
			<EditorContent {...props} editor={editor} className={cx(styles.editor, className)} />

			<BubbleMenu
				editor={editor}
				selectionParams={selectionParams}
				onItemClick={onBubbleMenuItemClick}
			/>
		</>
	);
};

export default memo(forwardRef(MDEditor));

