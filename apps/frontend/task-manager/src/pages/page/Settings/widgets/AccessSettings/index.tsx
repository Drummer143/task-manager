import React, { useCallback, useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ApiError,
	getPageAccess,
	getUserList,
	Page,
	parseApiError,
	updatePageAccess,
	User
} from "@task-manager/api";
import { App, Button, List, Tooltip } from "antd";
import { AxiosError } from "axios";

import { useStyles } from "./styles";

import { useAuthStore } from "../../../../../app/store/auth";
import AccessListItem from "../../../../../widgets/AccessList/AccessListItem";
import PopoverInfiniteSelect from "../../../../../widgets/PopoverInfiniteSelect";
import UserCard from "../../../../../widgets/UserCard";
import SettingsSection from "../SettingsSection";

interface AccessSettingsProps {
	page: Omit<
		Page,
		"tasks" | "owner" | "childPages" | "parentPage" | "workspace" | "boardStatuses"
	>;
}

const AccessSettings: React.FC<AccessSettingsProps> = ({ page }) => {
	const styles = useStyles().styles;

	const [newAddedUser, setNewAddedUser] = useState<User | undefined>();

	const queryClient = useQueryClient();

	const currentUser = useAuthStore(state => state.user);

	const message = App.useApp().message;

	const { data, error } = useQuery({
		queryFn: async () =>
			await getPageAccess({ workspaceId: currentUser.workspace.id, pageId: page.id }),
		enabled: !!currentUser.workspace.id,
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
			message.error(error.response?.data?.errorCode ?? "Failed to update page settings")
	});

	const parsedError = useMemo(() => error && parseApiError(error), [error]);

	const handleRoleChange = useCallback(
		(body: { userId: string; role?: string }) => {
			updateAccess({
				pageId: page.id,
				workspaceId: currentUser.workspace.id,
				body
			});
		},
		[currentUser.workspace.id, page.id, updateAccess]
	);

	return (
		<SettingsSection title="Access settings" error={parsedError}>
			<List
				dataSource={data}
				renderItem={item => (
					<AccessListItem
						user={item.user}
						role={item.role}
						editable
						onDelete={handleRoleChange}
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

			<div className={styles.addMemberButtonContainer}>
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
		</SettingsSection>
	);
};

export default AccessSettings;

