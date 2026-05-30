import React, { useMemo } from "react";

import { AudioOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Button, Flex, Popover, PopoverProps, Select, Space } from "antd";

import { useStyles } from "./styles";

import { buildDeviceOption } from "../../../../helpers/devices";
import { useDevicePrefs } from "../../../../store/devicePrefs";
import { STATUS_MESSAGE } from "../../helpers";
import { DeviceStatus } from "../../types";

const micPopoverTrigger: PopoverProps["trigger"] = ["hover"];

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

	const camOptions = useMemo(() => cams.map(cam => buildDeviceOption(cam, "Camera")), [cams]);
	const micOptions = useMemo(() => mics.map(mic => buildDeviceOption(mic, "Mic")), [mics]);

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

