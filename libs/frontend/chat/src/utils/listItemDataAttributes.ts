interface ListItemDataAttributes {
	"data-interactive": boolean;
	"data-item-id": string;
}

interface DataAttributes {
	interactive: boolean;
	itemId?: string;
}

export const generateListItemDataAttributes = (
	idx: string,
	interactive = true
): ListItemDataAttributes => ({
	"data-interactive": interactive,
	"data-item-id": idx
});

export const getDataAttribute = <T extends keyof ListItemDataAttributes>(
	el: Element,
	attr: T
): ListItemDataAttributes[T] => {
	const value = el.getAttribute(attr);

	switch (attr) {
		case "data-interactive":
			return (value === "true") as ListItemDataAttributes[T];
		case "data-item-id": {
			return value as ListItemDataAttributes[T];
		}
	}
};

export const getDataAttributes = (el: Element): DataAttributes | undefined => ({
	interactive: getDataAttribute(el, "data-interactive"),
	itemId: getDataAttribute(el, "data-item-id")
});

export const getClosestInteractiveListItem = (
	el: Element | null | undefined
): Element | null | undefined => el?.closest('[data-interactive="true"]');

