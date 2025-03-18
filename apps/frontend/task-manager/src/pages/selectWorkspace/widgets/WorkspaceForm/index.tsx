import React from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, Flex, Form, Input } from "antd";
import { createWorkspace } from "api";

import { requiredRule } from "pages/page/BoardPage/widgets/TaskForm/utils";
import ErrorList from "shared/ui/ErrorList";

interface WorkspaceFormProps {
	onClose: () => void;
	onSubmit: (id: string) => void;
}

interface FormValues {
	name: string;
	redirectOnSuccess: boolean;
}

const initialValues: FormValues = { name: "", redirectOnSuccess: true };

const WorkspaceForm: React.FC<WorkspaceFormProps> = ({ onClose, onSubmit }) => {
	const queryClient = useQueryClient();

	const { mutateAsync, error, isPaused } = useMutation({
		mutationFn: createWorkspace,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] })
	});

	const handleSubmit = async ({ name, redirectOnSuccess }: FormValues) => {
		const result = await mutateAsync({ name });

		if (!result) return;

		if (redirectOnSuccess) {
			onSubmit(result.id);
		} else {
			onClose();
		}
	};

	return (
		<Flex align="center" justify="center" className="w-full h-full" vertical gap="var(--ant-margin-sm)">
			<Form layout="vertical" initialValues={initialValues} onFinish={handleSubmit} style={{ minWidth: "300px" }}>
				<Form.Item label="Workspace name" name="name" rules={requiredRule}>
					<Input placeholder="Enter workspace name" />
				</Form.Item>

				<Form.Item name="redirectOnSuccess" valuePropName="checked">
					<Checkbox>Redirect on success</Checkbox>
				</Form.Item>

				<Form.Item status="error">
					<ErrorList error={error} />
				</Form.Item>

				<Form.Item>
					<Flex justify="flex-end" gap="var(--ant-margin-xs)">
						<Button htmlType="submit" type="primary" loading={isPaused}>
							Submit
						</Button>

						<Button htmlType="reset" onClick={onClose}>
							Cancel
						</Button>
					</Flex>
				</Form.Item>
			</Form>
		</Flex>
	);
};

export default WorkspaceForm;
