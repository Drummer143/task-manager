/**
 * Removes noise that Chrome on Windows adds to device labels:
 *   "Microphone (FIFINE Microphone) (3142:7301)" → "Microphone (FIFINE Microphone)"
 *
 * The "Default - " / "Communications - " prefixes are intentionally kept so
 * users can distinguish system-default devices in the picker.
 */
export const cleanDeviceLabel = (label: string): string =>
	label.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*$/i, "").trim();

export const buildDeviceOption = (
	device: MediaDeviceInfo,
	fallbackPrefix: string
): { label: string; value: string } => ({
	label: cleanDeviceLabel(device.label) || `${fallbackPrefix} ${device.deviceId.slice(0, 6)}`,
	value: device.deviceId
});
