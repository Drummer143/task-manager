import { useCallback, useState } from "react";

export const useLocalStorage = <T = unknown>(key: string, initialValue?: T) => {
	const [value, setValue] = useState<T>(() => {
		const storedValue = localStorage.getItem(key);

		try {
			return storedValue ? JSON.parse(storedValue) : initialValue;
		} catch (error) {
			console.error(`Error parsing localStorage ${key}:`, error);
			return initialValue;
		}
	});

	const setValueWithLocalStorage = useCallback<React.Dispatch<React.SetStateAction<T>>>(
		newValue =>
			setValue(prev => {
				const realValue =
					typeof newValue === "function" ? (newValue as (prev: T) => T)(prev) : newValue;

				localStorage.setItem(key, JSON.stringify(realValue));

				return realValue;
			}),
		[key]
	);

	return [value, setValueWithLocalStorage] as const;
};

