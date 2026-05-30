import React, { useCallback, useEffect, useMemo } from "react";

import { useMediaDeviceSelect } from "@livekit/components-react";
import { Select } from "antd";

import { buildDeviceOption } from "../../../../../helpers/devices";
import { useDevicePrefs } from "../../../../../store/devicePrefs";

interface DeviceSwitcherProps {
	kind: "audioinput" | "videoinput";
	fallbackLabel: string;
	disabled?: boolean;
}

const DeviceSwitcher: React.FC<DeviceSwitcherProps> = ({ kind, fallbackLabel, disabled }) => {
	const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind });

	// Keep the cross-session preferences store in sync so PreJoin defaults to
	// whatever the user picked while in a call.
	const setMicId = useDevicePrefs(state => state.setMicId);
	const setCamId = useDevicePrefs(state => state.setCamId);

	useEffect(() => {
		if (!activeDeviceId) return;
		if (kind === "audioinput") setMicId(activeDeviceId);
		else setCamId(activeDeviceId);
	}, [activeDeviceId, kind, setMicId, setCamId]);

	const options = useMemo(
		() => devices.map(d => buildDeviceOption(d, fallbackLabel)),
		[devices, fallbackLabel]
	);

	// Wrap to drop antd Select's second `option` argument — `setActiveMediaDevice`
	// accepts its own opts shape there and would type-error.
	const handleChange = useCallback(
		(id: string) => {
			setActiveMediaDevice(id);
		},
		[setActiveMediaDevice]
	);

	return (
		<Select
			value={activeDeviceId || undefined}
			onChange={handleChange}
			options={options}
			placeholder={fallbackLabel}
			disabled={disabled || devices.length === 0}
			style={{ minWidth: 200, maxWidth: 200 }}
		/>
	);
};

export default DeviceSwitcher;
