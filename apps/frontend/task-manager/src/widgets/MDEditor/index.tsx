import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState
} from "react";

import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { FileUploadPlugin } from "@task-manager/tiptap-file-upload-plugin";
import { FileRenderer, ReactNodeRenderer } from "@task-manager/tiptap-plugin-file-renderer";
import Placeholder from "@tiptap/extension-placeholder";
import {
	Editor,
	EditorContent,
	EditorContentProps,
	EditorEvents,
	JSONContent,
	NodeViewWrapper,
	useEditor
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button, Flex } from "antd";
import { Link } from "react-router";

import { useFileRendererStylets, useStyles } from "./styles";
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

const EMPTY_NODE_CLASS = "is-empty";

const FileRenderRenderer: ReactNodeRenderer = info => {
	const { styles } = useFileRendererStylets();

	const handleDeleteSelf = () => {
		if (!info.editor.isEditable) {
			return;
		}

		const pos = info.getPos();

		info.editor
			.chain()
			.focus()
			.deleteRange({ from: pos, to: pos + info.node.nodeSize })
			.run();
	};

	return (
		<NodeViewWrapper as="div">
			<Flex className={styles.wrapper} justify="space-between" align="center">
				<Link
					to={info.node.attrs["src"]}
					target="_blank"
					download={info.node.attrs["title"]}
				>
					{info.node.attrs["title"]}
				</Link>

				<Flex className={styles.buttonsContainer} gap="var(--ant-margin-xs)">
					<Button
						size="small"
						icon={<DownloadOutlined />}
						type="text"
						target="_blank"
						href={info.node.attrs["src"]}
						download={info.node.attrs["title"]}
					/>

					{info.editor.isEditable && (
						<Button
							size="small"
							type="text"
							danger
							icon={<DeleteOutlined />}
							onClick={handleDeleteSelf}
						/>
					)}
				</Flex>
			</Flex>
		</NodeViewWrapper>
	);
};

const extensions = [
	StarterKit,
	FileUploadPlugin,
	FileRenderer.configure({
		filesRules: {
			"image/*": {},
			"video/*": {},
			"!image/*": {
				render: memo(FileRenderRenderer)
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

