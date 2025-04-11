import React, { useCallback, useEffect, useState } from "react";

const tryParse = <Value>(value: string | null): Value | null => {
	if (value === null) return null;

	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

export const useStorage = <Value>(
	key: string,
	initialValue?: Value,
	listenChanges = false,
	storage: Storage = localStorage
) => {
	const [value, setValue] = useState<Value | null>(() => {
		const jsonValue = storage.getItem(key);

		return tryParse(jsonValue) ?? initialValue ?? null;
	});

	const setStorageValue: React.Dispatch<React.SetStateAction<Value | null>> = useCallback(
		value => {
			setValue(prev => {
				const realValue =
					typeof value === "function" ? (value as (value: Value | null) => Value | null)(prev) : value;

				storage.setItem(key, JSON.stringify(realValue));

				return realValue;
			});
		},
		[key]
	);

	const clear = useCallback(() => {
		storage.removeItem(key);
		setValue(null);
	}, [key]);

	useEffect(() => {
		if (!listenChanges) return;

		const listenStorage = (e: StorageEvent) => {
			console.debug(e);
			if (e.key === key) {
				setValue(tryParse(e.newValue));
			}
		};

		window.addEventListener("storage", listenStorage);

		return () => window.removeEventListener("storage", listenStorage);
	}, [key, listenChanges]);

	return [value, setStorageValue, clear] as const;
};
