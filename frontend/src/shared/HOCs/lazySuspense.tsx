import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazySuspense = <T extends React.ComponentType<any>>(
    load: () => Promise<{ default: T }>,
    fallback?: React.ReactNode
) => {
    return (props: React.ComponentProps<T>) => {
        const Lazy = React.lazy(load)
        return (
            <React.Suspense fallback={fallback}>
                <Lazy {...props} />
            </React.Suspense>
        )
    }
}
