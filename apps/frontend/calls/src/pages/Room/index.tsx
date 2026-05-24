import React, { useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { createCallToken } from "@task-manager/api/main";
import { Room as LiveKitRoom } from "@task-manager/calls-core";
import { Flex, Spin } from "antd";

const Room: React.FC = () => {
	const { mutateAsync, isPending, data } = useMutation({
		mutationFn: () => createCallToken()
	});

	useEffect(() => {
		mutateAsync();
	}, [mutateAsync]);

	if (isPending || !data) {
		return (
			<Flex style={{ height: "100vh", width: "100vw" }}>
				<Spin />
			</Flex>
		);
	}

	return <LiveKitRoom token={data.token} serverUrl="wss://task-manager-c7fc9t1d.livekit.cloud" />;
};

export default Room;

