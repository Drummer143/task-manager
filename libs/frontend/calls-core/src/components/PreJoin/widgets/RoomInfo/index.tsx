import React from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { parseApiError } from "@task-manager/api";
import { getCallRoom } from "@task-manager/api/calls";
import { joinRoom } from "@task-manager/api/calls";
import { getUserById } from "@task-manager/api/main";
import { App, Button, Flex, Spin, Typography } from "antd";
import { useParams, useSearchParams } from "react-router";

import { OnJoinCompleteParams } from "../../types";

interface RoomInfoProps {
	onJoinComplete: (params: Pick<OnJoinCompleteParams, "token" | "serverUrl">) => void;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ onJoinComplete }) => {
	const message = App.useApp().message;

	const roomId = useParams<{ id: string }>().id!;
	const roomToken = useSearchParams()[0].get("token");

	const { data: roomData, isPending: isLoadingRoom } = useQuery({
		queryKey: ["room", roomId],
		queryFn: () => getCallRoom(roomId)
	});

	const { data: creatorData, isPending: isLoadingCreator } = useQuery({
		enabled: !!roomData?.createdBy,
		queryKey: ["user", roomData?.createdBy],
		queryFn: () => getUserById(roomData!.createdBy)
	});

	const { isPending: isJoining, mutateAsync: join } = useMutation({
		mutationFn: () => joinRoom(roomData!.id, { accessToken: roomToken }),
		onSuccess: data =>
			onJoinComplete({
				token: data.token,
				serverUrl: data.serverUrl
			}),
		onError: error => {
			message.error(
				parseApiError(error, {
					403: "You don't have permission to join this room",
					unknown: "Failed to join room"
				})
			);
		}
	});

	if (isLoadingRoom || !roomData) {
		return (
			<Flex justify="center" align="center">
				<Spin />
			</Flex>
		);
	}

	return (
		<Flex vertical align="center" gap="var(--ant-padding-xs)">
			<Typography.Title level={4}>{roomData?.name}</Typography.Title>

			<Typography.Text>
				Created by: {isLoadingCreator ? <Spin /> : creatorData?.username}
			</Typography.Text>

			<Button type="primary" loading={isJoining} onClick={() => join()}>
				Join
			</Button>
		</Flex>
	);
};

export default RoomInfo;

