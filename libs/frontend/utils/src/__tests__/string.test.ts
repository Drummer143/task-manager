import { capitalize } from "..";

test("should capitalize the first letter of a string", () => {
	const str = "hello";
	const result = capitalize(str);

	expect(result).toBe("Hello");
});

