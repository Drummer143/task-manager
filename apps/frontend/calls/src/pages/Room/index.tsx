import React from "react";

import { Room as CallRoom, PreJoin } from "@task-manager/calls-core";
import { OnJoinCompleteParams } from "@task-manager/calls-core/components/PreJoin/types";

const Room: React.FC = () => {
	const [joinParams, setJoinParams] = React.useState<OnJoinCompleteParams | null>(null);

	return joinParams ? <CallRoom {...joinParams} /> : <PreJoin onJoinComplete={setJoinParams} />;
};

export default Room;

