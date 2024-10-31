import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazySuspense = <T extends React.ComponentType<any>>(
    load: () => Promise<{ default: T }>,
    suspenseProps?: React.SuspenseProps
) => {
    return (props: React.ComponentProps<T>) => {
        const Lazy = React.lazy(load)
        return (
            <React.Suspense {...suspenseProps}>
                <Lazy {...props} />
            </React.Suspense>
        )
    }
}
