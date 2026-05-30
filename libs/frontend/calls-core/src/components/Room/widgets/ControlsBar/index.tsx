import React from "react";

import {
	AudioMutedOutlined,
	AudioOutlined,
	DesktopOutlined,
	LogoutOutlined,
	VideoCameraAddOutlined,
	VideoCameraOutlined
} from "@ant-design/icons";
import {
	useLocalParticipant,
	useRoomContext,
	useTrackToggle
} from "@livekit/components-react";
import { Button, Flex, Space, Tooltip } from "antd";
import { Track } from "livekit-client";

import DeviceSwitcher from "./DeviceSwitcher";
import { useStyles } from "./styles";

const ControlsBar: React.FC = () => {
	const styles = useStyles().styles;

	const room = useRoomContext();
	const { localParticipant } = useLocalParticipant();

	const mic = useTrackToggle({ source: Track.Source.Microphone });
	const cam = useTrackToggle({ source: Track.Source.Camera });
	const screen = useTrackToggle({ source: Track.Source.ScreenShare });

	// `canPublish` reflects grants from the LiveKit JWT — if backend didn't
	// allow publishing for this identity, gray the buttons out.
	const canPublish = localParticipant.permissions?.canPublish ?? true;

	return (
		<Flex gap="middle" justify="center" align="center" className={styles.bar}>
			<Space.Compact>
				<Tooltip title={mic.enabled ? "Mute" : "Unmute"}>
					<Button
						type={mic.enabled ? "primary" : "default"}
						loading={mic.pending}
						disabled={!canPublish}
						icon={mic.enabled ? <AudioOutlined /> : <AudioMutedOutlined />}
						onClick={() => mic.toggle()}
					/>
				</Tooltip>
				<DeviceSwitcher kind="audioinput" fallbackLabel="Mic" disabled={!canPublish} />
			</Space.Compact>

			<Space.Compact>
				<Tooltip title={cam.enabled ? "Turn camera off" : "Turn camera on"}>
					<Button
						type={cam.enabled ? "primary" : "default"}
						loading={cam.pending}
						disabled={!canPublish}
						icon={cam.enabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
						onClick={() => cam.toggle()}
					/>
				</Tooltip>
				<DeviceSwitcher kind="videoinput" fallbackLabel="Camera" disabled={!canPublish} />
			</Space.Compact>

			<Tooltip title={screen.enabled ? "Stop sharing" : "Share screen"}>
				<Button
					shape="circle"
					size="large"
					type={screen.enabled ? "primary" : "default"}
					loading={screen.pending}
					disabled={!canPublish}
					icon={<DesktopOutlined />}
					onClick={() => screen.toggle()}
				/>
			</Tooltip>

			<Tooltip title="Leave">
				<Button
					shape="circle"
					size="large"
					danger
					type="primary"
					icon={<LogoutOutlined />}
					onClick={() => room.disconnect()}
				/>
			</Tooltip>
		</Flex>
	);
};

export default ControlsBar;
