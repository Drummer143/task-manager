import React, { memo, useCallback, useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPage, getPageList, PageType, parseApiError } from "@task-manager/api";
import { Button, Form, Input, Select, Typography } from "antd";
import ErrorList from "antd/es/form/ErrorList";
import { DefaultOptionType } from "antd/es/select";
import { createStyles } from "antd-style";

import Menu from "./Menu";

import { useAuthStore } from "../../../app/store/auth";
import { pageTypes } from "../../../shared/constants";
import FullSizeLoader from "../../../shared/ui/FullSizeLoader";
import Drawer from "../../../widgets/Drawer";

interface FormValues {
	title: string;
	type: PageType;
}

const pageTypeOptions: DefaultOptionType[] = pageTypes.map(type => ({
	value: type,
	label: type,
	key: type,
	title: type
}));

const useStyles = createStyles(({ css }) => ({
	pageListTitleWrapper: css`
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--ant-padding-xxs);

		padding: var(--ant-padding-xxs);
	`
}));

const NavPagesMenu: React.FC = () => {
	const { styles } = useStyles();

	const [form] = Form.useForm<FormValues>();

	const [creatingPageType, setCreatingPageType] = useState<boolean | string>(false);

	const queryClient = useQueryClient();

	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const { data, isLoading } = useQuery({
		queryKey: ["pages", "tree", workspaceId],
		enabled: !!workspaceId,
		queryFn: () =>
			getPageList({
				workspaceId,
				format: "tree"
			})
	});

	const { mutateAsync, isPending, error, reset } = useMutation({
		mutationFn: createPage,
		onSuccess: page => {
			queryClient.invalidateQueries({ queryKey: ["pages"] });
			queryClient.invalidateQueries({ queryKey: ["page", page.id] });

			setCreatingPageType(false);
		}
	});

	const parsedError = useMemo(() => (error ? [parseApiError(error)] : undefined), [error]);

	const closeCreatingPageType = useCallback(() => setCreatingPageType(false), []);

	const formProps = useMemo(
		() => ({
			form,
			onFinish: async (values: FormValues) => {
				await mutateAsync({
					workspaceId,
					page: {
						...values,
						parentId: typeof creatingPageType === "string" ? creatingPageType : undefined
					}
				});
			}
		}),
		[creatingPageType, form, mutateAsync, workspaceId]
	);

	const handleAfterClose = useCallback(() => {
		reset();

		form.resetFields();
	}, [form, reset]);

	if (isLoading) {
		return <FullSizeLoader />;
	}

	return (
		<>
			<div className={styles.pageListTitleWrapper}>
				<Typography.Title className="flex-1" level={5}>
					Pages
				</Typography.Title>

				<Button type="text" onClick={() => setCreatingPageType(true)} icon={<PlusOutlined />} />
			</div>

			<Menu pages={data} onSubPageCreate={setCreatingPageType} />

			<Drawer
				form={formProps}
				afterClose={handleAfterClose}
				okLoading={isPending}
				open={!!creatingPageType}
				onClose={closeCreatingPageType}
			>
				<Form.Item label="Page title" name="title">
					<Input placeholder="Page title" />
				</Form.Item>

				<Form.Item label="Page type" name="type">
					<Select
						placeholder="Page type"
						options={typeof creatingPageType === "string" ? pageTypeOptions.slice(0, 2) : pageTypeOptions}
					/>
				</Form.Item>

				<ErrorList errors={parsedError} />
			</Drawer>
		</>
	);
};

export default memo(NavPagesMenu);