import { useEffect } from "react";

const dimensionMaxMap = {
	xs: "479.98px",
	sm: "575.98px",
	md: "767.98px",
	lg: "991.98px",
	xl: "1199.98px",
	xxl: "1599.98px"
};

export const useWindowResize = (
	breakpoint: keyof typeof dimensionMaxMap | number,
	onResize: (breakpointReached: boolean) => void
) => {
	useEffect(() => {
		const matchMedia = globalThis?.window?.matchMedia;

		if (!matchMedia) {
			return;
		}

		const mediaQuery = matchMedia(
			`screen and (max-width: ${typeof breakpoint === "string" ? dimensionMaxMap[breakpoint] : breakpoint + "px"})`
		);

		onResize(mediaQuery.matches);

		const listener = (event: MediaQueryListEvent) => onResize(event.matches);

		mediaQuery.addEventListener("change", listener);
	}, [breakpoint, onResize]);
};