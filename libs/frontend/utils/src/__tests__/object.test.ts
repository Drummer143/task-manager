import { removeEmptyFields } from "..";

test("should remove null, undefined, and empty strings", () => {
	const obj = { a: null, b: undefined, c: "", d: 0, e: false };
	const result = removeEmptyFields(obj);

	expect(result).toEqual({ d: 0, e: false });
});

