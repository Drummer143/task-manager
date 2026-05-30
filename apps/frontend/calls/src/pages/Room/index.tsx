import React from "react";

import { Room as CallRoom, PreJoin } from "@task-manager/calls-core";
import { OnJoinCompleteParams } from "@task-manager/calls-core/components/PreJoin/types";
import { useNavigate } from "react-router";

const Room: React.FC = () => {
	const navigate = useNavigate();
	const [joinParams, setJoinParams] = React.useState<OnJoinCompleteParams | null>(null);

	const handleLeave = React.useCallback(() => {
		setJoinParams(null);
		navigate("/", { replace: true });
	}, [navigate]);

	return joinParams ? (
		<CallRoom {...joinParams} onLeave={handleLeave} />
	) : (
		<PreJoin onJoinComplete={setJoinParams} />
	);
};

export default Room;
