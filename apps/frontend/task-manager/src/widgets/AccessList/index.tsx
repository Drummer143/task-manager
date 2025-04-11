import React, { memo, useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserList as defaultGetUserList, EntityAccess, User } from "@task-manager/api";
import { Button, Tooltip, Typography } from "antd";

import AccessListItem from "./AccessListItem";

import PopoverInfiniteSelect from "../PopoverInfiniteSelect";
import UserCard from "../UserCard";

export interface AccessListProps<Q extends EntityAccess[] = EntityAccess[]> {
	queryKey: QueryKey;

	editable?: boolean;

	updateAccess: (body: { role?: string; userId: string }) => Promise<unknown>;
	getAccessList: () => Promise<Q>;

	getUserList?: typeof defaultGetUserList;
}

const AccessList = <Q extends EntityAccess[] = EntityAccess[]>({
	editable,
	getUserList = defaultGetUserList,
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
				/>
			))}

			{editable && (
				<>
					{newAddedUser && (
						<AccessListItem
							user={newAddedUser}
							editable
							onRoleChange={updateAccess}
							isPending={isUpdatingAccess && updatedAccessArgs?.userId === newAddedUser.id}
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
