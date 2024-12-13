import { useEffect } from "react";

import { useDebounce } from "use-debounce";

export const useDebouncedEffect = <T>(value: T, callback?: (value: T) => void, delay = 500) => {
	const [debouncedValue] = useDebounce(value, delay);

	useEffect(() => {
		callback?.(debouncedValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue]);
};
