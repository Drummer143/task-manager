import React, { createRef } from "react";

import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { Editor } from "@tiptap/core";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

import SlashMenu, { type SlashMenuGroup, type SlashMenuRef } from ".";

type StyleUtils = { css: (...args: unknown[]) => string };

vi.mock("antd-style", () => ({
	createStyles: (fn: (utils: StyleUtils) => Record<string, string>) => {
		const styles = fn({ css: () => "" });

		return () => ({
			styles,
			cx: (...classes: (string | false | null | undefined)[]) =>
				classes.filter(Boolean).join(" ")
		});
	}
}));

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

// ─── helpers ────────────────────────────────────────────────────────────────

/** Asserts ref is attached and returns it — avoids non-null assertions throughout tests. */
function menu(ref: React.RefObject<SlashMenuRef | null>): SlashMenuRef {
	if (!ref.current) throw new Error("SlashMenuRef not attached to component");
	return ref.current;
}

const makeGroups = (): SlashMenuGroup[] => [
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

const baseProps = {
	editor: null as unknown as Editor,
	range: { from: 0, to: 0 },
	query: "",
	text: "",
	command: vi.fn(),
	decorationNode: null,
	clientRect: null,
	placement: "bottom-start",
	offset: { mainAxis: 4, crossAxis: 0 },
	flip: true,
	floatingUi: null,
	mount: null,
	loading: false
} as unknown as Omit<SuggestionProps, "items">;

const keyDown = (key: string) =>
	({ event: new KeyboardEvent("keydown", { key }) }) as unknown as SuggestionKeyDownProps;

describe("SlashMenu – rendering", () => {
	it("renders null when items is empty", () => {
		const { container } = render(<SlashMenu items={[]} {...baseProps} />);

		expect(container).toBeEmptyDOMElement();
	});

	it("renders group titles and item buttons", () => {
		render(<SlashMenu items={makeGroups()} {...baseProps} />);

		expect(screen.getByText("Format")).toBeInTheDocument();
		expect(screen.getByText("Marks")).toBeInTheDocument();
		expect(screen.getByText("Heading 1")).toBeInTheDocument();
		expect(screen.getByText("Heading 2")).toBeInTheDocument();
		expect(screen.getByText("Bold")).toBeInTheDocument();
	});

	it("calls item onClick when button is clicked", () => {
		const groups = makeGroups();

		render(<SlashMenu items={groups} {...baseProps} />);

		fireEvent.click(screen.getByText("Heading 1"));
		expect(groups[0].items[0].onClick).toHaveBeenCalledOnce();
	});
});

describe("SlashMenu – keyboard navigation", () => {
	it("ArrowDown returns true (consumed)", () => {
		const ref = createRef<SlashMenuRef>();

		render(<SlashMenu items={makeGroups()} {...baseProps} ref={ref} />);

		expect(menu(ref).onKeyDown(keyDown("ArrowDown"))).toBe(true);
	});

	it("ArrowUp returns true (consumed)", () => {
		const ref = createRef<SlashMenuRef>();

		render(<SlashMenu items={makeGroups()} {...baseProps} ref={ref} />);

		expect(menu(ref).onKeyDown(keyDown("ArrowUp"))).toBe(true);
	});

	it("Enter returns true and selects the first item by default", () => {
		const ref = createRef<SlashMenuRef>();
		const groups = makeGroups();

		render(<SlashMenu items={groups} {...baseProps} ref={ref} />);

		expect(menu(ref).onKeyDown(keyDown("Enter"))).toBe(true);
		expect(groups[0].items[0].onClick).toHaveBeenCalledOnce();
	});

	it("ArrowDown then Enter selects the next item", () => {
		const ref = createRef<SlashMenuRef>();
		const groups = makeGroups();

		render(<SlashMenu items={groups} {...baseProps} ref={ref} />);

		act(() => { menu(ref).onKeyDown(keyDown("ArrowDown")) }); // (0,0) → (0,1)
		menu(ref).onKeyDown(keyDown("Enter"));

		expect(groups[0].items[1].onClick).toHaveBeenCalledOnce();
	});

	it("ArrowDown crosses group boundaries", () => {
		const ref = createRef<SlashMenuRef>();
		const groups = makeGroups();

		render(<SlashMenu items={groups} {...baseProps} ref={ref} />);

		act(() => {
			menu(ref).onKeyDown(keyDown("ArrowDown")); // (0,0) → (0,1)
			menu(ref).onKeyDown(keyDown("ArrowDown")); // (0,1) → (1,0)
		});
		menu(ref).onKeyDown(keyDown("Enter"));

		expect(groups[1].items[0].onClick).toHaveBeenCalledOnce();
	});

	it("ArrowDown wraps from last item back to first", () => {
		const ref = createRef<SlashMenuRef>();
		const groups = makeGroups(); // 3 items total: (0,0) (0,1) (1,0)

		render(<SlashMenu items={groups} {...baseProps} ref={ref} />);

		act(() => {
			menu(ref).onKeyDown(keyDown("ArrowDown")); // → (0,1)
			menu(ref).onKeyDown(keyDown("ArrowDown")); // → (1,0)
			menu(ref).onKeyDown(keyDown("ArrowDown")); // → (0,0) wrap
		});
		menu(ref).onKeyDown(keyDown("Enter"));

		expect(groups[0].items[0].onClick).toHaveBeenCalledOnce();
	});

	it("ArrowUp from first item wraps to last item", () => {
		const ref = createRef<SlashMenuRef>();
		const groups = makeGroups();

		render(<SlashMenu items={groups} {...baseProps} ref={ref} />);

		act(() => { menu(ref).onKeyDown(keyDown("ArrowUp")) }); // (0,0) → (1,0) wrap
		menu(ref).onKeyDown(keyDown("Enter"));

		expect(groups[1].items[0].onClick).toHaveBeenCalledOnce();
	});

	it("returns false for unhandled keys", () => {
		const ref = createRef<SlashMenuRef>();

		render(<SlashMenu items={makeGroups()} {...baseProps} ref={ref} />);

		expect(menu(ref).onKeyDown(keyDown("Escape"))).toBe(false);
		expect(menu(ref).onKeyDown(keyDown("Tab"))).toBe(false);
	});

	it("returns false for navigation keys when items is empty", () => {
		const ref = createRef<SlashMenuRef>();

		render(<SlashMenu items={[]} {...baseProps} ref={ref} />);

		expect(menu(ref).onKeyDown(keyDown("ArrowDown"))).toBe(false);
		expect(menu(ref).onKeyDown(keyDown("ArrowUp"))).toBe(false);
		expect(menu(ref).onKeyDown(keyDown("Enter"))).toBe(false);
	});
});

describe("SlashMenu – mouse interaction", () => {
	it("hovering an item makes Enter select it", () => {
		const ref = createRef<SlashMenuRef>();
		const groups = makeGroups();

		render(<SlashMenu items={groups} {...baseProps} ref={ref} />);

		fireEvent.mouseEnter(screen.getByText("Heading 2"));

		menu(ref).onKeyDown(keyDown("Enter"));
		expect(groups[0].items[1].onClick).toHaveBeenCalledOnce();
	});

	it("hovering then ArrowDown advances from hovered position", () => {
		const ref = createRef<SlashMenuRef>();
		const groups = makeGroups();

		render(<SlashMenu items={groups} {...baseProps} ref={ref} />);

		fireEvent.mouseEnter(screen.getByText("Heading 1")); // back to (0,0)

		act(() => { menu(ref).onKeyDown(keyDown("ArrowDown")) }); // (0,0) → (0,1)
		menu(ref).onKeyDown(keyDown("Enter"));

		expect(groups[0].items[1].onClick).toHaveBeenCalledOnce();
	});
});
