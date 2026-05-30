import { devtools, persist } from "zustand/middleware";
import { create } from "zustand/react";

interface DevicePrefsState {
	micId?: string;
	camId?: string;
	speakerId?: string;

	setMicId: (id: string | undefined) => void;
	setCamId: (id: string | undefined) => void;
	setSpeakerId: (id: string | undefined) => void;
}

export const useDevicePrefs = create<DevicePrefsState>()(
	devtools(
		persist(
			set => ({
				setMicId: micId => set({ micId }),
				setCamId: camId => set({ camId }),
				setSpeakerId: speakerId => set({ speakerId })
			}),
			{ name: "device-prefs" }
		),
		{ enabled: import.meta.env.DEV, name: "device-prefs" }
	)
);
