import React, { forwardRef, memo, useCallback, useRef } from "react";

import {
	headingsPlugin,
	listsPlugin,
	markdownShortcutPlugin,
	MDXEditor,
	MDXEditorMethods,
	MDXEditorProps,
	quotePlugin,
	thematicBreakPlugin
} from "@mdxeditor/editor";

import { useStyles } from "./styled";

interface MDEditorProps {
	value?: string;
	editing?: boolean;
	minHeight?: string;
	autoFocus?: boolean;
	horizontalPadding?: boolean;

	onChange?: NonNullable<MDXEditorProps["onChange"]>;
}

const plugins = [headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), markdownShortcutPlugin()];

const MDEditor: React.ForwardRefRenderFunction<MDXEditorMethods, MDEditorProps> = (
	{ onChange, value = "", horizontalPadding, editing, minHeight, autoFocus },
	ref
) => {
	const { bg, editor, editorScroll, placeholder } = useStyles({
		contentEditableClassName: "editable-row",
		editing,
		horizontalPadding,
		minHeight
	}).styles;
	const editorRef = useRef<MDXEditorMethods | null>(null);

	const handleBgClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
		e => {
			e.stopPropagation();

			if (editing) {
				editorRef.current?.focus();
			}
		},
		[editing]
	);

	const handleRef = useCallback(
		(r: MDXEditorMethods | null) => {
			editorRef.current = r;

			if (typeof ref === "function") {
				ref(r);
			} else if (ref) {
				ref.current = r;
			}
		},
		[ref]
	);

	return (
		<div className={editorScroll}>
			<div className={bg} onClick={handleBgClick}>
				<MDXEditor
					className={editor}
					placeholder={<p className={placeholder}>Write something...</p>}
					ref={handleRef}
					readOnly={!editing}
					contentEditableClassName="editable-row"
					autoFocus={autoFocus}
					markdown={value}
					onChange={onChange}
					plugins={plugins}
				/>
			</div>
		</div>
	);
};

export default memo(forwardRef(MDEditor));