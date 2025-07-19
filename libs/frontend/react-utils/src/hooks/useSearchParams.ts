import { useCallback, useMemo } from "react";

import { useSearchParams as useInnerSearchParams } from "react-router";

export type ParamsDictionary<T extends string = string> = Record<T, string | undefined | null>;
export type SetParamsType<T extends string = string> = React.Dispatch<
	React.SetStateAction<Partial<ParamsDictionary<T>>>
>;

export const removeNullsAndUndefinedFields = <T>(obj: T): { [K in keyof T]: string } => {
	const result: Record<string, string> = {};

	for (const key in obj) {
		const value = obj[key];

		if (value !== null && value !== undefined && value !== "") {
			result[key] = String(value);
		}
	}

	return result as { [K in keyof T]: string };
};

export const useSearchParams = <T extends string = string>(): [
	Readonly<ParamsDictionary<T>>,
	SetParamsType<T>
] => {
	const [searchParams, setSearchParams] = useInnerSearchParams();

	const paramsMemo = useMemo(
		() => Object.fromEntries(searchParams) as ParamsDictionary<T>,
		[searchParams]
	);

	const setParams = useCallback<SetParamsType<T>>(
		action => {
			const newParams =
				typeof action === "function"
					? action(
							Object.fromEntries(
								new URLSearchParams(location.search)
							) as ParamsDictionary<T>
						)
					: action;

			setSearchParams(removeNullsAndUndefinedFields(newParams), { replace: true });
		},
		[]
	);

	return [paramsMemo, setParams];
};

