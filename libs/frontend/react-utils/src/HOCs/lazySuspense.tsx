import { ComponentProps, ComponentType, lazy, ReactNode, Suspense } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazySuspense = <T extends ComponentType<any>>(
	load: () => Promise<{ default: T }>,
	fallback?: ReactNode
) => {
	const Lazy = lazy(load);

	const LazySuspended = (props: ComponentProps<T>) => (
		<Suspense fallback={fallback}>
			<Lazy {...props} />
		</Suspense>
	);

	return LazySuspended;
};

