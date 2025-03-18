import React, { useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { getUserList, getWorkspace, getWorkspaceAccess, parseApiError, updateWorkspaceAccess, User } from "@task-manager/api";
import { useMessageOnErrorCallback } from "@task-manager/utils";
import { App, Button, List, Modal, Tooltip } from "antd";

import * as s from "./styles";

import PopoverInfiniteSelect from "../../../../widgets/PopoverInfiniteSelect";
import UserCard from "../../../../widgets/UserCard";
import AccessListItem from "../AccessListItem";

interface SettingsProps {
	open: boolean;
	workspaceId: string;

	onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose, open, workspaceId }) => {
	const [newAddedUser, setNewAddedUser] = useState<User | undefined>();

	const queryClient = useQueryClient();

	const message = App.useApp().message;

	const [
		{ data: workspace, error: workspaceError, isLoading: workspaceLoading },
		{ data: workspaceAccess, error: workspaceAccessError, isLoading: workspaceAccessLoading }
	] = useQueries({
		queries: [
			{
				queryKey: ["workspace"],
				queryFn: () => getWorkspace({ workspaceId: workspaceId! })
			},
			{
				queryKey: ["workspaceAccess"],
				queryFn: () => getWorkspaceAccess({ workspaceId: workspaceId! })
			}
		]
	});

	const {
		mutateAsync: updateAccess,
		variables,
		isPending
	} = useMutation({
		mutationFn: updateWorkspaceAccess,
		onSuccess: (_, { body: { role } }) => {
			setNewAddedUser(undefined);

			if (role !== "owner" && role !== "admin") {
				onClose();
				queryClient.invalidateQueries({ queryKey: [workspace?.id] });
			} else {
				queryClient.invalidateQueries({ queryKey: ["pageAccesses"] });
			}
		},
		onError: error => message.error(error.message ?? "Failed to update page settings")
	});

	const parsedError = useMemo(
		() => (workspaceError || workspaceAccessError) && parseApiError(workspaceError || workspaceAccessError),
		[workspaceAccessError, workspaceError]
	);

	const handleRoleChange = useMessageOnErrorCallback({
		message: "Error while updating page access",
		callback: async (userId: string, role?: string) =>
			!!(await updateAccess({ workspaceId, body: { userId, role } }))
	});

	return (
		<Modal
			open={open}
			loading={workspaceLoading || workspaceAccessLoading}
			onCancel={onClose}
			onClose={onClose}
			footer={!parsedError}
		>
			{parsedError ? (
				<s.Alert message="Error while getting page settings" description={parsedError} type="error" />
			) : (
				<>
					<s.Header level={4}>Settings for page &quot;{workspace?.name}&quot;</s.Header>

					<s.Body>
						<List
							dataSource={workspaceAccess}
							renderItem={item => (
								<AccessListItem
									user={item.user}
									role={item.role}
									onRoleChange={handleRoleChange}
									isPending={isPending && variables?.body.userId === item.user.id}
								/>
							)}
						/>

						{newAddedUser && (
							<AccessListItem
								user={newAddedUser}
								onRoleChange={handleRoleChange}
								isPending={isPending && variables?.body.userId === newAddedUser.id}
							/>
						)}

						<s.AddMemberButtonContainer>
							<PopoverInfiniteSelect
								fetchItems={getUserList}
								getItemValue={(user: User) => user.id}
								itemRender={user => <UserCard hideOpenLink user={user} />}
								queryKey={["users"]}
								onChange={setNewAddedUser}
								value={newAddedUser}
								extraParams={{ exclude: workspaceAccess?.map(access => access.user.id).join(",") }}
								placement="bottomRight"
								trigger="click"
							>
								<Tooltip
									placement="bottom"
									title={
										newAddedUser && "Give role to previously selected user before adding a new one"
									}
								>
									<Button disabled={!!newAddedUser} icon={<PlusOutlined />}>
										Add new user
									</Button>
								</Tooltip>
							</PopoverInfiniteSelect>
						</s.AddMemberButtonContainer>
					</s.Body>
				</>
			)}
		</Modal>
	);
};

export default Settings;
