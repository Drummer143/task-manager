import React, { useMemo } from "react";

import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelSoftDeleteWorkspace, softDeleteWorkspace } from "@task-manager/api";
import { useFunctionWithFeedback } from "@task-manager/react-utils";
import { Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import dayjs from "dayjs";

import { today } from "../../../../shared/constants";

interface DangerZoneProps {
	workspaceId: string;

	deletedAt?: string;
}

const useStyles = createStyles(({ css }) => ({
	dangerZone: css`
		padding: var(--ant-padding);

		border: 1px dashed var(--ant-color-error);
		border-radius: var(--ant-border-radius);
	`
}));

const DangerZone: React.FC<DangerZoneProps> = ({ workspaceId, deletedAt }) => {
	const { dangerZone } = useStyles().styles;

	const queryClient = useQueryClient();

	const { mutateAsync } = useMutation({
		mutationKey: ["workspace", workspaceId],
		mutationFn: deletedAt ? cancelSoftDeleteWorkspace : softDeleteWorkspace,
		onSuccess: () =>
			queryClient.invalidateQueries({
				predicate: queryKey => queryKey.queryKey.includes(workspaceId)
			})
	});

	const timeUntilDelete = useMemo(
		() => (deletedAt ? dayjs(deletedAt).diff(today, "days") : 0),
		[deletedAt]
	);

	const handleDeleteWorkspace = useFunctionWithFeedback({
		callback: async () => {
			await mutateAsync({
				pathParams: { workspaceId }
			});

			return true;
		},
		message: deletedAt ? "Falled to cancel workspace deletion" : "Failed to delete workspace",
		successMessage: deletedAt
			? "Workspace deletion cancelled"
			: "Workspace will be deleted in 14 days",
		confirm: deletedAt
			? undefined
			: {
					title: "Delete workspace",
					content: "Are you sure you want to delete this workspace?"
				}
	});

	return (
		<section>
			<Typography.Title level={4}>Danger Zone</Typography.Title>

			<div className={dangerZone}>
				{deletedAt ? (
					<Flex align="center" justify="space-between" gap="var(--ant-padding-sm)">
						<div>
							<Typography.Title level={5}>Cancel deletion</Typography.Title>

							<Typography.Text type="secondary">
								You have {timeUntilDelete} days to undo workspace deletion
							</Typography.Text>
						</div>

						<Button
							danger
							type="primary"
							icon={<UndoOutlined />}
							onClick={handleDeleteWorkspace}
						>
							Cancel workspace deletion
						</Button>
					</Flex>
				) : (
					<Flex align="center" justify="space-between" gap="var(--ant-padding-sm)">
						<div>
							<Typography.Title level={5}>Delete workspace</Typography.Title>
							<Typography.Text type="secondary">
								You will have 14 days to undo this action
							</Typography.Text>
						</div>

						<Button
							danger
							type="primary"
							icon={<DeleteOutlined />}
							onClick={handleDeleteWorkspace}
						>
							Delete workspace
						</Button>
					</Flex>
				)}
			</div>
		</section>
	);
};

export default DangerZone;

