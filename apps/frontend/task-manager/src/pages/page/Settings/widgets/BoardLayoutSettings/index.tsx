import React, { useCallback } from "react";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { BoardStatus, Page, updateBoardStatus, UpdateBoardStatusArgs } from "@task-manager/api";
import { GetProp, MenuProps } from "antd";

import { useAuthStore } from "../../../../../app/store/auth";
import TaskBoard from "../../../../../widgets/TaskBoard";
import ColumnEditDivider from "../ColumnEditDivider";
import SettingsSection from "../SettingsSection";

interface BoardLayoutSettingsProps {
	page: Omit<Page, "tasks" | "owner" | "childPages" | "parentPage" | "workspace">;
}

const BoardLayoutSettings: React.FC<BoardLayoutSettingsProps> = ({ page }) => {
	const { mutateAsync } = useMutation({
		mutationFn: ({
			boardStatusId,
			...body
		}: UpdateBoardStatusArgs["body"] & { boardStatusId: string }) =>
			updateBoardStatus({
				workspaceId: useAuthStore.getState().user.workspace.id,
				pageId: page.id,
				boardStatusId,
				body
			})
	});

	const columnMenu = useCallback<(status: BoardStatus) => GetProp<MenuProps, "items">>(
		status => [
			{
				key: "edit",
				label: "Edit column",
				icon: <EditOutlined />
			},
			{
				key: "delete",
				label: "Delete column",
				icon: <DeleteOutlined />,
				danger: true
			}
		],
		[]
	);

	const onColumnMove = useCallback(
		(payload: { statusId: string; newPosition: number }) => {
			mutateAsync({
				boardStatusId: payload.statusId,
				position: payload.newPosition
			});
		},
		[mutateAsync]
	);

	return (
		<SettingsSection title="Board layout settings">
			<div
				style={{
					backgroundColor: "var(--ant-color-bg-elevated)",
					padding: "var(--ant-padding-xs)",
					borderRadius: "var(--ant-border-radius)"
				}}
			>
				<TaskBoard
					columnMenu={columnMenu}
					height="150px"
					onColumnMove={onColumnMove}
					statuses={page.boardStatuses}
					renderDivider={index => <ColumnEditDivider index={index} />}
				/>
			</div>
		</SettingsSection>
	);
};

export default BoardLayoutSettings;

