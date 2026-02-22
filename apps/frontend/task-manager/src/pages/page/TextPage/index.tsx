import React, { useCallback, useRef, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { createUploadToken, DetailedPageResponseText, updatePage } from "@task-manager/api";
import { createUploadToken, updatePage } from "@task-manager/api/main";
import { DetailedPageResponseText, TipTapContent } from "@task-manager/api/main/schemas";
import { Editor, JSONContent } from "@tiptap/react";
import { App, Button } from "antd";

import { useStyles } from "./styled";

import MDEditor from "../../../widgets/MDEditor";

interface TextPageProps {
	page: DetailedPageResponseText;
}

const TextPage: React.FC<TextPageProps> = ({ page }) => {
	const [editing, setEditing] = useState(false);

	const { controlsWrapper } = useStyles().styles;

	const message = App.useApp().message;

	const editorRef = useRef<Editor | null>(null);

	const queryClient = useQueryClient();

	const { mutateAsync, isPending } = useMutation({
		mutationFn: (content: TipTapContent) => updatePage(page.id, { content }),
		onSuccess: data => {
			setEditing(false);

			queryClient.invalidateQueries({ queryKey: [data.id] });
		},
		onError: error => message.error(error.message ?? "Failed to update page")
	});

	const handleEditButtonClick = useCallback(() => {
		setEditing(true);

		setTimeout(() => editorRef.current?.commands.focus(), 25);
	}, []);

	const handleReset = useCallback(() => {
		editorRef.current?.commands.setContent(page.content as JSONContent);

		setEditing(false);
	}, [page.content]);

	const handleSave = async () => {
		mutateAsync(editorRef.current?.getJSON() as TipTapContent);
	};

	const getFileUploadToken = useCallback(
		async (file: File, assetId: string) =>
			createUploadToken({
				assetId,
				name: file.name,
				target: {
					type: "pageText",
					id: page.id
				}
			}).then(res => res.token),
		[page.id]
	);

	return (
		<>
			<MDEditor
				ref={editorRef}
				editable={editing}
				value={(page.content as JSONContent) ?? undefined}
				getFileUploadToken={getFileUploadToken}
			/>

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

