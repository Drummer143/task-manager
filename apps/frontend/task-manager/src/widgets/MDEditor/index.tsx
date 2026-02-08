import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState
} from "react";

import { MessageToHost, UploadCompleteEvent } from "@task-manager/file-transfer-worker";
import {
	Editor,
	EditorContent,
	EditorContentProps,
	EditorEvents,
	JSONContent,
	useEditor
} from "@tiptap/react";
import { Dropdown } from "antd";

import { EMPTY_NODE_CLASS, getExtensions } from "./extensions";
import { useStyles } from "./styles";
import { useContextMenuItems } from "./useContextMenuItems";
import BubbleMenu from "./widgets/BubbleMenu";

import { useAuthStore } from "../../app/store/auth";
import { initWorker } from "../../app/worker";

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

	getFileUploadToken: (file: File, assetId: string) => Promise<string>;

	onChange?: (value: JSONContent) => void;
}

const MDEditor: React.ForwardRefRenderFunction<Editor | null, MDEditorProps> = (
	{ editable = true, value, onChange, getFileUploadToken, className, ...props },
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

	const extensions = useMemo(() => getExtensions(getFileUploadToken), [getFileUploadToken]);

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

	const token = useAuthStore(state => state.identity?.access_token);

	useEffect(() => {
		const worker = initWorker(token);

		const handleMessage = (event: MessageEvent<MessageToHost>) => {
			if (!editor) {
				return;
			}

			if (event.data.type === "uploadComplete") {
				const fileId = event.data.fileId;

				editor.state.doc.forEach((node, pos) => {
					if ((node.attrs.id || node.attrs.assetId) === fileId) {
						editor
							.chain()
							.setNodeSelection(pos)
							.updateAttributes(node.type.name, {
								src: `/storage/files/${fileId}`,
								href: `/storage/files/${fileId}`,
								id: (event.data as UploadCompleteEvent).data.asset.id,
								type: (event.data as UploadCompleteEvent).data.mime_type,
								title: (event.data as UploadCompleteEvent).data.asset.name,
								alt: (event.data as UploadCompleteEvent).data.asset.name,
								width: "100%",
								height: "auto"
							})
							.run();
					}
				});
			} else if (event.data.type === "uploadCancelled") {
				const fileId = event.data.fileId;

				editor.state.doc.forEach((node, pos) => {
					if ((node.attrs.id || node.attrs.assetId) === fileId) {
						editor
							.chain()
							.setNodeSelection(pos)
							.deleteRange({ from: pos, to: pos + node.nodeSize })
							.run();
					}
				});
			}
		};

		worker.onReady(() => {
			worker.on("message", handleMessage);
		});

		return () => {
			worker.off("message", handleMessage);
		};
	}, [editor]);

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

