import React from "react";

import { useConnectionState } from "@livekit/components-react";
import { Alert } from "antd";
import { ConnectionState } from "livekit-client";

const ReconnectingBanner: React.FC = () => {
	const state = useConnectionState();

	if (state !== ConnectionState.Reconnecting) {
		return null;
	}

	return <Alert banner type="warning" title="Reconnecting…" />;
};

export default ReconnectingBanner;
