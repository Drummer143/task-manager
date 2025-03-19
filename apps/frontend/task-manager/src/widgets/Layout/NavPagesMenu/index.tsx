import React, { memo, useCallback, useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPage, getPageList, PageType, parseApiError } from "@task-manager/api";
import { Button, Form, Input, Select, Typography } from "antd";
import ErrorList from "antd/es/form/ErrorList";
import { DefaultOptionType } from "antd/es/select";

import Menu from "./Menu";
import { PageListTitleWrapper } from "./Menu/styles";

import { useAppStore } from "../../../app/store/app";
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

const NavPagesMenu: React.FC = () => {
	const [creatingPageType, setCreatingPageType] = useState<boolean | string>(false);

	const queryClient = useQueryClient();

	const workspaceId = useAppStore(state => state.workspaceId);

	const { data, isLoading } = useQuery({
		queryKey: ["nav-pages"],
		enabled: !!workspaceId,
		queryFn: () =>
			getPageList({
				workspaceId: workspaceId!,
				include: ["childrenPages"]
			})
	});

	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: createPage,
		onSuccess: page => {
			queryClient.invalidateQueries({ queryKey: ["nav-pages"] });
			queryClient.invalidateQueries({ queryKey: ["page", page.id] });

			setCreatingPageType(false);
		}
	});

	const parsedError = useMemo(() => (error ? [parseApiError(error)] : undefined), [error]);

	const handleFormSubmit = useCallback(
		async (values: FormValues) => {
			await mutateAsync({
				workspaceId: workspaceId!,
				page: {
					...values,
					parentId: typeof creatingPageType === "string" ? creatingPageType : undefined
				}
			});
		},
		[creatingPageType, mutateAsync, workspaceId]
	);

	if (isLoading) {
		return <FullSizeLoader />;
	}

	return (
		<>
			<PageListTitleWrapper>
				<Typography.Title className="flex-1" level={5}>
					Pages
				</Typography.Title>

				<Button type="text" onClick={() => setCreatingPageType(true)} icon={<PlusOutlined />} />
			</PageListTitleWrapper>

			<Menu pages={data} onSubPageCreate={setCreatingPageType} />

			<Drawer
				form
				okLoading={isPending}
				onOk={handleFormSubmit}
				open={!!creatingPageType}
				onClose={() => setCreatingPageType(false)}
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
