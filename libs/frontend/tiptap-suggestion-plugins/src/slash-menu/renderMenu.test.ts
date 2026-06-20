import { getSuggestionConfig } from "./renderMenu";
import type { SlashMenuGroup } from "./SlashMenu";

vi.mock("@tiptap/react", () => ({ ReactRenderer: vi.fn() }));
vi.mock("tippy.js", () => ({
	default: vi.fn(() => [{ destroy: vi.fn(), setProps: vi.fn() }])
}));

const groups: SlashMenuGroup[] = [
	{
		title: "Format",
		items: [
			{ key: "h1", title: "Heading 1", onClick: vi.fn() },
			{ key: "h2", title: "Heading 2", onClick: vi.fn() }
		]
	},
	{
		title: "Marks",
		items: [{ key: "bold", title: "Bold", onClick: vi.fn() }]
	}
];

describe("getSuggestionConfig – items filter", () => {
	// The items function only uses `query` from its argument
	type ItemsFn = (args: { query: string; editor: unknown }) => SlashMenuGroup[];
	const getItems = (query: string) =>
		(getSuggestionConfig(groups).items as ItemsFn)({ query, editor: {} });

	it("returns all groups when query is empty", () => {
		expect(getItems("")).toEqual(groups);
	});

	it("is case-insensitive", () => {
		const result = getItems("HEADING");

		expect(result).toHaveLength(1);
		expect(result[0].title).toBe("Format");
		expect(result[0].items).toHaveLength(2);
	});

	it("returns only groups that have matching items", () => {
		const result = getItems("bold");

		expect(result).toHaveLength(1);
		expect(result[0].title).toBe("Marks");
	});

	it("returns empty array when nothing matches", () => {
		expect(getItems("xyz")).toHaveLength(0);
	});

	it("matches partial query", () => {
		const result = getItems("Head");

		expect(result[0].items).toHaveLength(2);
	});

	it("does not mutate the original groups", () => {
		getItems("Heading 1");
		expect(groups[0].items).toHaveLength(2);
	});
});
