import React, { useCallback, useRef, useState } from "react";

import { MDXEditorMethods } from "@mdxeditor/editor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Button } from "antd";
import { updateTextPageContent } from "api";

import MDEditor from "widgets/MDEditor";

import * as s from "./styled";

interface TextPageProps {
	page: Omit<Page, "pageAccesses" | "tasks" | "owner" | "childrenPages" | "parentPage">;
}

const TextPage: React.FC<TextPageProps> = ({ page }) => {
	const [text, setText] = useState(page.textLines.text);
	const [editing, setEditing] = useState(false);

	const message = App.useApp().message;

	const editorRef = useRef<MDXEditorMethods | null>(null);
	const initialValue = useRef(page.textLines.text);

	const queryClient = useQueryClient();

	const { mutateAsync, isPending } = useMutation({
		mutationFn: updateTextPageContent,
		onSuccess: data => {
			setEditing(false);

			queryClient.invalidateQueries({ queryKey: [data.id] });
		},
		onError: error => message.error(error.message ?? "Failed to update page")
	});

	const handleEditButtonClick = useCallback(() => {
		setEditing(true);

		setTimeout(() => editorRef.current?.focus(), 25);
	}, []);

	const handleReset = useCallback(() => {
		editorRef.current?.setMarkdown(initialValue.current);

		setEditing(false);
	}, []);

	const handleSave = async () => {
		initialValue.current = text;

		mutateAsync({ id: page.id, text });
	};

	return (
		<>
			<MDEditor autoFocus horizontalPadding onChange={setText} ref={editorRef} editing={editing} value={text} />

			<s.ControlsWrapper>
				{editing ? (
					<>
						<Button loading={isPending} onClick={handleSave}>
							Save
						</Button>
						<Button onClick={handleReset}>Cancel</Button>
					</>
				) : (
					<Button onClick={handleEditButtonClick}>Edit</Button>
				)}
			</s.ControlsWrapper>
		</>
	);
};

export default TextPage;
