import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from 'store/auth'

export const withAuthPageProtection = <P extends object>(Component: React.ComponentType<P>) => {
    const ProtectedComponent: React.FC<P> = (props) => {
        const user = useAuthStore((state) => state.user)

        if (user) {
            return <Navigate to="/profile" replace />
        }

        return <Component {...props} />
    }

    return ProtectedComponent
}
