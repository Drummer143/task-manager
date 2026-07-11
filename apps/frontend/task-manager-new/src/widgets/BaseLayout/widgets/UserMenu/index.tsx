import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@task-manager/api/main";
import { Avatar } from "antd";

import { reactQueryTags } from "../../../../shared/reactQueryTags";

const UserMenu: React.FC = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: reactQueryTags.profile,
		queryFn: () => getProfile()
	});

	return (
		<div>
			<Avatar src={data?.picture} />
		</div>
	);
};

export default UserMenu;

