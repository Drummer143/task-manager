import React, { useCallback, useRef, useState } from "react";

import { MDXEditorMethods } from "@mdxeditor/editor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Page, updatePage } from "@task-manager/api";
import { App, Button } from "antd";

import { useStyles } from "./styled";

import { useAppStore } from "../../../app/store/app";
import MDEditor from "../../../widgets/MDEditor";

interface TextPageProps {
	page: Omit<Page, "tasks" | "owner" | "childPages" | "parentPage">;
}

const TextPage: React.FC<TextPageProps> = ({ page }) => {
	const [text, setText] = useState(page.text || "");
	const [editing, setEditing] = useState(false);

	const { controlsWrapper } = useStyles().styles;

	const message = App.useApp().message;

	const editorRef = useRef<MDXEditorMethods | null>(null);
	const initialValue = useRef(page.text || "");

	const queryClient = useQueryClient();

	const { mutateAsync, isPending } = useMutation({
		mutationFn: updatePage,
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

		mutateAsync({ pageId: page.id, page: { text }, workspaceId: useAppStore.getState().workspaceId! });
	};

	return (
		<>
			<MDEditor autoFocus horizontalPadding onChange={setText} ref={editorRef} editing={editing} value={text} />

			<div className={controlsWrapper}>
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
			</div>
		</>
	);
};

export default TextPage;
