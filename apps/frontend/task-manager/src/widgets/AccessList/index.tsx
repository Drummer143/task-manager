import React, { memo, useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsersList as defaultGetUsersList } from "@task-manager/api/main";
import { Role, User } from "@task-manager/api/main/schemas";
import { Button, Tooltip, Typography } from "antd";

import AccessListItem from "./AccessListItem";

import PopoverInfiniteSelect from "../PopoverInfiniteSelect";
import UserCard from "../UserCard";

export interface EntityAccess {
	id: string;
	role: Role;

	user: User;

	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
}

export interface AccessListProps<Q extends EntityAccess[] = EntityAccess[]> {
	queryKey: QueryKey;

	editable?: boolean;

	createAccess: (body: { role: Role; userId: string }) => Promise<unknown>;
	updateAccess: (body: { role?: Role; userId: string }) => Promise<unknown>;
	getAccessList: () => Promise<Q>;

	getUserList?: typeof defaultGetUsersList;
}

const AccessList = <Q extends EntityAccess[] = EntityAccess[]>({
	editable,
	getUserList = defaultGetUsersList,
	createAccess: propsCreateAccess,
	updateAccess: propsUpdateAccess,
	getAccessList,
	queryKey
}: AccessListProps<Q>) => {
	const [newAddedUser, setNewAddedUser] = useState<User | undefined>();

	const { data: accesses } = useQuery({
		queryKey,
		queryFn: getAccessList
	});

	const queryClient = useQueryClient();

	const {
		mutateAsync: createAccess,
		isPending: isCreatingAccess,
		variables: createdAccessArgs
	} = useMutation({
		mutationFn: propsCreateAccess,
		onSuccess: () => {
			setNewAddedUser(undefined);
			queryClient.invalidateQueries({ queryKey });
		}
	});

	const {
		mutateAsync: updateAccess,
		isPending: isUpdatingAccess,
		variables: updatedAccessArgs
	} = useMutation({
		mutationFn: propsUpdateAccess,
		onSuccess: () => queryClient.invalidateQueries({ queryKey })
	});

	const isOnlyOneOwner = useMemo(() => {
		return accesses?.filter(access => access.role === "owner").length === 1;
	}, [accesses]);

	return (
		<>
			<Typography.Title level={4}>Workspace access</Typography.Title>

			{accesses?.map(access => (
				<AccessListItem
					editable={editable && (access.role !== "owner" || !isOnlyOneOwner)}
					user={access.user}
					role={access.role}
					onRoleChange={updateAccess}
					onDelete={updateAccess}
					isPending={isUpdatingAccess && updatedAccessArgs?.userId === access.user.id}
				/>
			))}

			{editable && (
				<>
					{newAddedUser && (
						<AccessListItem
							user={newAddedUser}
							editable
							onRoleChange={createAccess}
							onDelete={() => setNewAddedUser(undefined)}
							isPending={
								isCreatingAccess && createdAccessArgs?.userId === newAddedUser.id
							}
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
				</>
			)}
		</>
	);
};

export default memo(AccessList);

