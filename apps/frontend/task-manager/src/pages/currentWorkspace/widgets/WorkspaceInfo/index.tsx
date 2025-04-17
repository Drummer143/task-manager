import React, { memo, useMemo } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkspace, Workspace } from "@task-manager/api";
import { Button, Flex, Form, Input, Typography } from "antd";

interface WorkspaceInfoProps {
	workspace: Omit<Workspace, "pages">;

	editable?: boolean;
}

interface FormValues {
	name: string;
}

const WorkspaceInfo: React.FC<WorkspaceInfoProps> = ({ workspace, editable }) => {
	const [form] = Form.useForm<FormValues>();

	const queryClient = useQueryClient();

	const initialValues = useMemo<FormValues | undefined>(
		() =>
			workspace
				? {
						name: workspace.name
					}
				: undefined,
		[workspace]
	);

	const { mutateAsync, isPending } = useMutation({
		mutationFn: async (body: FormValues) => {
			if (initialValues?.name === body.name) {
				throw new Error("Cancelled");
			}

			return updateWorkspace({ workspaceId: workspace.id, body });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: query => query.queryKey.includes("workspace") || query.queryKey.includes(workspace.id)
			});
		}
	});

	return (
		<Form layout="vertical" form={form} onFinish={mutateAsync} initialValues={initialValues}>
			<Typography.Title level={4}>Workspace info</Typography.Title>

			<Form.Item label="Name" name="name">
				{editable ? <Input /> : <Typography.Text>{workspace.name}</Typography.Text>}
			</Form.Item>

			{editable && (
				<Flex gap="var(--ant-margin-sm)">
					<Button htmlType="submit" type="primary" loading={isPending}>
						Save
					</Button>

					<Button onClick={() => form.resetFields()} htmlType="button" type="default">
						Cancel
					</Button>
				</Flex>
			)}
		</Form>
	);
};

export default memo(WorkspaceInfo);
