import React, { useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, List, Modal, Tooltip } from "antd";
import { getPageAccess, getUserList, updatePageAccess } from "api";

import { useMessageOnErrorCallback } from "shared/hooks";
import { parseUseQueryError } from "shared/utils/errors";
import PopoverInfiniteSelect from "widgets/PopoverInfiniteSelect";
import UserCard from "widgets/UserCard";

import * as s from "./styles";

import AccessListItem from "../AccessListItem";

interface SettingsProps {
	open: boolean;
	page: Omit<Page, "pageAccesses" | "tasks" | "owner" | "textLines" | "childrenPages" | "parentPage">;

	onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose, open, page }) => {
	const [newAddedUser, setNewAddedUser] = useState<User | undefined>();

	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery({
		queryFn: async () => await getPageAccess(page.id),
		enabled: open,
		queryKey: ["pageAccesses"]
	});

	const {
		mutateAsync: updateAccess,
		variables,
		isPending
	} = useMutation({
		mutationFn: updatePageAccess,
		onSuccess: (_, { body: { role } }) => {
			setNewAddedUser(undefined);

			if (role !== "owner" && role !== "admin") {
				onClose();
				queryClient.invalidateQueries({ queryKey: ["page", page.id] });
			} else {
				queryClient.invalidateQueries({ queryKey: ["pageAccesses"] });
			}
		}
	});

	const parsedError = useMemo(() => error && parseUseQueryError(error), [error]);

	const handleRoleChange = useMessageOnErrorCallback({
		message: "Error while updating page access",
		callback: async (userId: string, role?: string) =>
			!!(await updateAccess({ pageId: page.id, body: { userId, role } }))
	});

	return (
		<Modal open={open} loading={isLoading} onCancel={onClose} onClose={onClose} footer={!parsedError}>
			{parsedError ? (
				<s.Alert message="Error while getting page settings" description={parsedError} type="error" />
			) : (
				<>
					<s.Header level={4}>Settings for page &quot;{page.name}&quot;</s.Header>

					<s.Body>
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

						<s.AddMemberButtonContainer>
							<PopoverInfiniteSelect
								fetchItems={getUserList}
								getItemValue={(user: User) => user.id}
								itemRender={user => <UserCard hideOpenLink user={user} />}
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
