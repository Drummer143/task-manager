import React, { useCallback, useRef, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Page, updatePage } from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";
import { Editor } from "@tiptap/react";
import { App, Button } from "antd";

import { useStyles } from "./styled";

import { useAuthStore } from "../../../app/store/auth";
import FullSizeLoader from "../../../shared/ui/FullSizeLoader";

const MDEditor = lazySuspense(() => import("../../../widgets/MDEditor"), <FullSizeLoader />);

interface TextPageProps {
	page: Omit<Page, "tasks" | "owner" | "childPages" | "parentPage" | "workspace">;
}

const TextPage: React.FC<TextPageProps> = ({ page }) => {
	const [editing, setEditing] = useState(false);

	const { controlsWrapper } = useStyles().styles;

	const message = App.useApp().message;

	const editorRef = useRef<Editor | null>(null);

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

		setTimeout(() => editorRef.current?.commands.focus(), 25);
	}, []);

	const handleReset = useCallback(() => {
		editorRef.current?.commands.setContent(page.text || "");

		setEditing(false);
	}, [page.text]);

	const handleSave = async () => {
		mutateAsync({
			pageId: page.id,
			page: { text: editorRef.current?.getJSON() },
			workspaceId: useAuthStore.getState().user.workspace.id
		});
	};

	return (
		<>
			<MDEditor ref={editorRef} editable={editing} value={page.text} />

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

