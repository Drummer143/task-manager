import React, { useCallback, useEffect, useState } from "react";

const tryParse = <Value>(value: string | null): Value | null => {
	if (value === null) return null;

	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

export const useLocalStorage = <Value>(
	key: string,
	initialValue?: Value,
	notListen?: boolean
): [Value | null, React.Dispatch<React.SetStateAction<Value | null>>] => {
	const [value, setValue] = useState<Value | null>(() => {
		const jsonValue = localStorage.getItem(key);

		return tryParse(jsonValue) ?? initialValue ?? null;
	});

	const setLocalStorageValue: React.Dispatch<React.SetStateAction<Value | null>> = useCallback(
		value => {
			setValue(prev => {
				const realValue =
					typeof value === "function" ? (value as (value: Value | null) => Value | null)(prev) : value;

				localStorage.setItem(key, JSON.stringify(realValue));

				return realValue;
			});
		},
		[key]
	);

	useEffect(() => {
		if (notListen) return;

		const listenLocalStorage = (e: StorageEvent) => {
			if (e.key === key) {
				setValue(tryParse(e.newValue));
			}
		};

		window.addEventListener("storage", listenLocalStorage);

		return () => window.removeEventListener("storage", listenLocalStorage);
	}, [key, notListen]);

	return [value, setLocalStorageValue];
};
