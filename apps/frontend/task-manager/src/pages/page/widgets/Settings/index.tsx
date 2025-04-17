import React, { useCallback, useMemo, useState } from "react";

import { PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, getPageAccess, getUserList, Page, parseApiError, updatePageAccess, User } from "@task-manager/api";
import { useDisclosure } from "@task-manager/utils";
import { Alert, App, Button, List, Modal, Tooltip, Typography } from "antd";
import { AxiosError } from "axios";

import { useStyles } from "./styles";

import { useAuthStore } from "../../../../app/store/auth";
import PopoverInfiniteSelect from "../../../../widgets/PopoverInfiniteSelect";
import UserCard from "../../../../widgets/UserCard";
import AccessListItem from "../AccessListItem";

interface SettingsProps {
	page: Omit<Page, "tasks" | "owner" | "childPages" | "parentPage">;
}

const Settings: React.FC<SettingsProps> = ({ page }) => {
	const { addMemberButtonContainer, alert, body, header } = useStyles().styles;

	const [newAddedUser, setNewAddedUser] = useState<User | undefined>();

	const { onClose, onOpen, open } = useDisclosure();

	const queryClient = useQueryClient();

	const currentUser = useAuthStore(state => state.user);

	const message = App.useApp().message;

	const { data, isLoading, error } = useQuery({
		queryFn: async () => await getPageAccess({ workspaceId: currentUser.workspace.id, pageId: page.id }),
		enabled: open && !!currentUser.workspace.id,
		queryKey: ["pageAccesses"]
	});

	const {
		mutateAsync: updateAccess,
		variables,
		isPending
	} = useMutation({
		mutationFn: updatePageAccess,
		retry: (_, error) => (error.response?.status || 0) > 499,
		onSuccess: (_, { body: { role, userId } }) => {
			setNewAddedUser(undefined);

			if (userId === currentUser.id && role !== "admin" && role !== "owner") {
				queryClient.invalidateQueries({ queryKey: [page.id] });
			} else {
				queryClient.invalidateQueries({ queryKey: ["pageAccesses"] });
			}
		},
		onError: (error: AxiosError<ApiError>) =>
			message.error(error.response?.data?.message ?? "Failed to update page settings")
	});

	const parsedError = useMemo(() => error && parseApiError(error), [error]);

	const handleRoleChange = useCallback(
		(userId: string, role?: string) => {
			updateAccess({
				pageId: page.id,
				workspaceId: currentUser.workspace.id,
				body: {
					userId,
					role
				}
			});
		},
		[currentUser.workspace.id, page.id, updateAccess]
	);

	const handleClose = useCallback(() => {
		setNewAddedUser(undefined);

		onClose();
	}, [onClose]);

	return (
		<>
			<Button onClick={onOpen} icon={<SettingOutlined />}>
				Settings
			</Button>

			<Modal open={open} loading={isLoading} onCancel={handleClose} onClose={handleClose} footer={!parsedError}>
				{parsedError ? (
					<Alert
						className={alert}
						message="Error while getting page settings"
						description={parsedError}
						type="error"
					/>
				) : (
					<>
						<Typography.Title className={header} level={4}>
							Settings for page &quot;{page.title}&quot;
						</Typography.Title>

						<div className={body}>
							<List
								dataSource={data}
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

							<div className={addMemberButtonContainer}>
								<PopoverInfiniteSelect
									fetchItems={getUserList}
									getItemValue={user => user.id}
									renderItem={user => <UserCard hideOpenLink user={user} />}
									queryKey={["users"]}
									onChange={setNewAddedUser}
									value={newAddedUser}
									extraParams={{ exclude: data?.map(access => access.user.id).join(",") }}
									placement="bottomRight"
									trigger="click"
								>
									<Tooltip
										placement="bottom"
										title={
											newAddedUser &&
											"Give role to previously selected user before adding a new one"
										}
									>
										<Button disabled={!!newAddedUser} icon={<PlusOutlined />}>
											Add new user
										</Button>
									</Tooltip>
								</PopoverInfiniteSelect>
							</div>
						</div>
					</>
				)}
			</Modal>
		</>
	);
};

export default Settings;
