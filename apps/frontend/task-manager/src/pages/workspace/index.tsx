import React, { useCallback, useMemo, useState } from "react";

import { EditOutlined, ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQueries } from "@tanstack/react-query";
import {
	getPageList,
	getUserList,
	getWorkspace,
	getWorkspaceAccess,
	Page,
	parseApiError,
	updateWorkspaceAccess,
	User
} from "@task-manager/api";
import { Alert, Button, Divider, Flex, Form, Input, Tooltip, Tree, Typography } from "antd";
import { BasicDataNode, DataNode } from "antd/es/tree";
import { createStyles } from "antd-style";
import { useParams } from "react-router-dom";

import AccessListItem from "./widgets/AccessListItem";

import FullSizeLoader from "../../shared/ui/FullSizeLoader";
import PopoverInfiniteSelect from "../../widgets/PopoverInfiniteSelect";
import UserCard from "../../widgets/UserCard";

interface FormValues {
	name: string;
}

const useStyles = createStyles(({ css }) => ({
	container: css`
		padding: var(--ant-padding);
	`,
	addMemberButton: css`
		margin-top: var(--ant-margin-md);
	`
}));

const pageListToTree = (
	pages?: Omit<Page, "workspace" | "owner" | "parentPage" | "tasks">[]
): (BasicDataNode | DataNode)[] | undefined =>
	pages?.map(page => ({
		key: page.id,
		title: (
			<Flex align="center" gap="var(--ant-margin-xs)">
				<Typography.Title level={5}>{page.title}</Typography.Title>

				<Button
					type="text"
					size="small"
					title="Open in new tab"
					onClick={() => window.open(`/pages/${page.id}`, "_blank")}
					icon={<ExportOutlined />}
				/>

				<Button type="text" title="Edit page" size="small" icon={<EditOutlined />} />
			</Flex>
		),
		checkable: false,
		selectable: false,
		children: pageListToTree(page.childPages)
	}));

const Workspace: React.FC = () => {
	const workspaceId = useParams<{ id: string }>().id!;

	const [newAddedUser, setNewAddedUser] = useState<User | undefined>();

	const { container, addMemberButton } = useStyles().styles;

	const [
		{ data: workspace, isLoading: isLoadingWorkspace, error: errorWorkspace },
		{ data: pages },
		{ data: accesses }
	] = useQueries({
		queries: [
			{
				queryKey: ["workspace", "owner", workspaceId],
				queryFn: () => getWorkspace({ workspaceId, include: ["owner"] })
			},
			{
				queryKey: ["pages", "tree", workspaceId],
				queryFn: () => getPageList({ workspaceId, format: "tree" })
			},
			{
				queryKey: ["workspace", "accesses", workspaceId],
				queryFn: () => getWorkspaceAccess({ workspaceId })
			}
		]
	});

	const {
		mutateAsync: updateAccess,
		isPending: isUpdatingAccess,
		variables: updatedAccessArgs
	} = useMutation({
		mutationKey: ["workspace", "accesses", workspaceId],
		mutationFn: updateWorkspaceAccess
	});

	const editable = workspace?.role === "admin" || workspace?.role === "owner";

	const isOnlyOneOwner = useMemo(() => {
		return accesses?.filter(access => access.role === "owner").length === 1;
	}, [accesses]);

	const inititalValues = useMemo<FormValues | undefined>(
		() =>
			workspace
				? {
						name: workspace.name
					}
				: undefined,
		[workspace]
	);

	const pageTree = useMemo(() => pageListToTree(pages), [pages]);

	const handleRoleChange = useCallback(
		(userId: string, role?: string) => {
			updateAccess({
				workspaceId,
				body: {
					userId,
					role
				}
			});
		},
		[updateAccess, workspaceId]
	);

	if (isLoadingWorkspace) {
		return <FullSizeLoader />;
	}

	if (errorWorkspace || !workspace) {
		return <Alert description={parseApiError(errorWorkspace)} type="error" message="Error" />;
	}

	return (
		<Form className={container} initialValues={inititalValues}>
			<Typography.Title level={3}>Workspace settings</Typography.Title>

			<div>
				<Typography.Title level={4}>Owner: {workspace.owner.username}</Typography.Title>
			</div>

			<Divider />

			<Typography.Title level={4}>Workspace info</Typography.Title>

			<Form.Item label="Workspace name" name="name">
				<Input />
			</Form.Item>

			<Divider />

			<Typography.Title level={4}>Pages</Typography.Title>

			<Tree treeData={pageTree} />

			<Divider />

			<Typography.Title level={4}>Workspace access</Typography.Title>

			{accesses?.map(access => (
				<AccessListItem
					editable={editable && (access.role !== "owner" || !isOnlyOneOwner)}
					user={access.user}
					role={access.role}
					onRoleChange={handleRoleChange}
				/>
			))}

			{newAddedUser && (
				<AccessListItem
					user={newAddedUser}
					editable
					onRoleChange={handleRoleChange}
					isPending={isUpdatingAccess && updatedAccessArgs?.body.userId === newAddedUser.id}
				/>
			)}

			<PopoverInfiniteSelect
				fetchItems={getUserList}
				getItemValue={user => user.id}
				renderItem={user => <UserCard hideOpenLink user={user} />}
				queryKey={["users"]}
				onChange={setNewAddedUser}
				value={newAddedUser}
				extraParams={{ exclude: accesses?.map(access => access.user.id).join(",") }}
				placement="bottomRight"
				trigger="click"
			>
				<Tooltip
					placement="bottom"
					title={newAddedUser && "Give role to previously selected user before adding a new one"}
				>
					<Button className={addMemberButton} disabled={!!newAddedUser} icon={<PlusOutlined />}>
						Add new user
					</Button>
				</Tooltip>
			</PopoverInfiniteSelect>
		</Form>
	);
};

export default Workspace;
