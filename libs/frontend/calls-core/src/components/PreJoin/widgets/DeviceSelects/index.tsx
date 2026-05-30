import React, { useMemo } from "react";

import { AudioOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Button, Flex, Popover, PopoverProps, Select, Space } from "antd";

import { useStyles } from "./styles";

import { useDevicePrefs } from "../../../../store/devicePrefs";
import { STATUS_MESSAGE } from "../../helpers";
import { DeviceStatus } from "../../types";

const micPopoverTrigger: PopoverProps["trigger"] = ["hover"];

// "Default - Speakers (Realtek) (3142:7301)" -> "Speakers (Realtek)"
// "Communications - Microphone (USB Audio)" -> "Microphone (USB Audio)"
const cleanDeviceLabel = (label: string): string =>
	label
		.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*$/i, "")
		// .replace(/^(Default|Communications)\s*-\s*/i, "")
		.trim();

interface DeviceSelectsProps {
	cams: MediaDeviceInfo[];
	mics: MediaDeviceInfo[];

	micStatus: DeviceStatus;
	camStatus: DeviceStatus;

	videoEnabled: boolean;
	audioEnabled: boolean;

	micVolume: number;

	setAudioEnabled: (enabled: boolean) => void;
	setVideoEnabled: (enabled: boolean) => void;
}

const DeviceSelects: React.FC<DeviceSelectsProps> = ({
	cams,
	mics,
	micStatus,
	camStatus,
	videoEnabled,
	audioEnabled,
	micVolume,
	setAudioEnabled,
	setVideoEnabled
}) => {
	const styles = useStyles().styles;

	const { micId, camId, setMicId, setCamId } = useDevicePrefs();

	const camOptions = useMemo(
		() =>
			cams.map(cam => ({
				label: cleanDeviceLabel(cam.label) || `Camera ${cam.deviceId.slice(0, 6)}`,
				value: cam.deviceId
			})),
		[cams]
	);

	const micOptions = useMemo(
		() =>
			mics.map(mic => ({
				label: cleanDeviceLabel(mic.label) || `Mic ${mic.deviceId.slice(0, 6)}`,
				value: mic.deviceId
			})),
		[mics]
	);

	return (
		<Flex gap="var(--ant-padding-sm)">
			<Space.Compact>
				<Popover
					trigger={micPopoverTrigger}
					title={
						micStatus === "ok" ? (
							<div className={styles.volumeBarContainer}>
								<div
									style={{ width: `${Math.min(100, micVolume * 100)}%` }}
									className={styles.volumeBar}
								/>
							</div>
						) : (
							<div className={styles.volumeBarErrorText}>
								{STATUS_MESSAGE[micStatus].mic}
							</div>
						)
					}
				>
					<Button
						type={audioEnabled ? "primary" : "default"}
						icon={<AudioOutlined />}
						disabled={micStatus === "no-device" || micStatus === "denied"}
						onClick={() => setAudioEnabled(!audioEnabled)}
					/>
				</Popover>

				<Select
					value={micId}
					onChange={setMicId}
					options={micOptions}
					placeholder="Microphone"
					disabled={micStatus === "no-device" || micStatus === "denied"}
					className={styles.deviceSelect}
				/>
			</Space.Compact>

			<Space.Compact>
				<Button
					type={videoEnabled ? "primary" : "default"}
					icon={<VideoCameraOutlined />}
					disabled={camStatus === "no-device" || camStatus === "denied"}
					onClick={() => setVideoEnabled(!videoEnabled)}
				/>

				<Select
					value={camId}
					onChange={setCamId}
					options={camOptions}
					placeholder="Camera"
					disabled={camStatus === "no-device" || camStatus === "denied"}
					className={styles.deviceSelect}
				/>
			</Space.Compact>
		</Flex>
	);
};

export default DeviceSelects;

