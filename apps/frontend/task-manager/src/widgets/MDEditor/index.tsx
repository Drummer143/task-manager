import React, { forwardRef, memo, useCallback, useRef } from "react";

import {
	headingsPlugin,
	listsPlugin,
	markdownShortcutPlugin,
	MDXEditorMethods,
	MDXEditorProps,
	quotePlugin,
	thematicBreakPlugin
} from "@mdxeditor/editor";

import * as s from "./styled";

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
		<s.EditorScroll $horizontalPadding={horizontalPadding}>
			<s.Bg onClick={handleBgClick} $editing={editing}>
				<s.MDEditor
					placeholder={<s.Placeholder>Write something...</s.Placeholder>}
					ref={handleRef}
					readOnly={!editing}
					contentEditableClassName="editable-row"
					autoFocus={autoFocus}
					$minHeight={minHeight}
					markdown={value}
					onChange={onChange}
					plugins={plugins}
				/>
			</s.Bg>
		</s.EditorScroll>
	);
};

export default memo(forwardRef(MDEditor));
