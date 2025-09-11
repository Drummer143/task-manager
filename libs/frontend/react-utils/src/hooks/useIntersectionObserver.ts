import { useEffect, useMemo } from "react";

interface UseIntersectionObserverProps {
	onIntersection: IntersectionObserverCallback;

	target?: Element | null;
	options?: IntersectionObserverInit;
}

export const useIntersectionObserver = ({
	onIntersection,
	target,
	options
}: UseIntersectionObserverProps) => {
	const observer = useMemo(
		() => new IntersectionObserver(onIntersection, options),
		[onIntersection, options]
	);

	useEffect(() => {
		if (!target) {
			return;
		}

		observer.observe(target);

		return observer.disconnect.bind(observer);
	}, [observer, target]);
};

