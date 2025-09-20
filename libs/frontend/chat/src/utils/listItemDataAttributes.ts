interface ListItemDataAttributes {
	"data-interactive": boolean;
	"data-item-idx": number;
}

interface DataAttributes {
	interactive: boolean;
	itemIdx?: number;
}

export const generateListItemDataAttributes = (
	idx: number,
	interactive = true
): ListItemDataAttributes => ({
	"data-interactive": interactive,
	"data-item-idx": idx
});

export const getDataAttribute = <T extends keyof ListItemDataAttributes>(
	el: Element,
	attr: T
): ListItemDataAttributes[T] => {
	const value = el.getAttribute(attr);

	switch (attr) {
		case "data-interactive":
			return (value === "true") as ListItemDataAttributes[T];
		case "data-item-idx": {
			const num = Number(value);

			return (isNaN(num) ? undefined : num) as ListItemDataAttributes[T];
		}
	}
};

export const getDataAttributes = (el: Element): DataAttributes | undefined => ({
	interactive: getDataAttribute(el, "data-interactive"),
	itemIdx: getDataAttribute(el, "data-item-idx")
});

export const getClosestInteractiveListItem = (
	el: Element | null | undefined
): Element | null | undefined => el?.closest('[data-interactive="true"]');

