const ignoredValues: unknown[] = [null, undefined, ""];

export const removeEmptyFields = <T extends object>(obj: T) => {
	const newObj: Partial<T> = {};

	for (const key in obj) {
		if (!ignoredValues.includes(obj[key])) {
			newObj[key] = obj[key];
		}
	}

	return newObj;
};