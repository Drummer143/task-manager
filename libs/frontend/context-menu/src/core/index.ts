export interface MenuItem {
	title: string;

	danger?: boolean;

	onClick: () => void;
}

type GetMenuItemsFunction = (e: MouseEvent) => MenuItem[];

type Menu = MenuItem[] | GetMenuItemsFunction;

interface ItemInfo {
	name: string;
	menu: Menu;
	element: HTMLElement;

	stopPropagation?: boolean;
}

const registry = new WeakMap<HTMLElement, ItemInfo>();

export interface ViewItemInfo extends Omit<ItemInfo, "menu" | "stopPropagation"> {
	menu: MenuItem[];
}

export const registerContextMenu = (info: ItemInfo) => {
	registry.set(info.element, info);

	return () => {
		registry.delete(info.element);
	};
};

export const setContextMenuListener = (props: {
	root?: HTMLElement;
	onContextMenu: (items: ViewItemInfo[], event: MouseEvent) => void;
}) => {
	const root = props.root ?? document.body;

	const handleContextMenu = (event: MouseEvent) => {
		const items: ViewItemInfo[] = [];

		const path = event.composedPath();

		for (const node of path) {
			if (!(node instanceof HTMLElement)) {
				continue;
			}

			const info = registry.get(node);

			if (info) {
				const resolvedMenu = typeof info.menu === "function" ? info.menu(event) : info.menu;

				if (resolvedMenu.length) {
					items.push({
						element: info.element,
						name: info.name,
						menu: resolvedMenu
					});

					if (info.stopPropagation) {
						break;
					}
				}
			}

			if (node === root) {
				break;
			}
		}

		if (!items.length) {
			return;
		}

		event.preventDefault();

		props.onContextMenu(items, event);
	};

	root.addEventListener("contextmenu", handleContextMenu);

	return () => root.removeEventListener("contextmenu", handleContextMenu);
};

