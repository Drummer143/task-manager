import React from "react";

import { Avatar, AvatarProps } from "antd";

interface UserAvatarProps {
	src?: string;
	size?: AvatarProps["size"];
	loginName?: string;
	displayName?: string;
}

const getInitials = (name = "", loginName = "") => {
	let credentials = "";

	if (name) {
		const split = name.split(" ");

		if (split) {
			const initials = split[0].charAt(0) + (split[1] ? split[1].charAt(0) : "");

			credentials = initials;
		} else {
			credentials = name.charAt(0);
		}
	} else {
		const username = loginName.split("@")[0];
		let separator = "_";

		if (username.includes("-")) {
			separator = "-";
		}
		if (username.includes(".")) {
			separator = ".";
		}
		const split = username.split(separator);
		const initials = split[0].charAt(0) + (split[1] ? split[1].charAt(0) : "");

		credentials = initials;
	}

	return credentials;
};

const UserAvatar: React.FC<UserAvatarProps> = ({ displayName, loginName, size, src }) => {
	return (
		<Avatar size={size} src={src}>
			{!src && getInitials(displayName ?? loginName, loginName)}{" "}
		</Avatar>
	);
};

export default UserAvatar;

