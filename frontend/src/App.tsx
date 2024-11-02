import { RouterProvider } from 'react-router-dom'

import router from './app/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, ThemeConfig } from 'antd'
import { useEffect } from 'react'
import { useAuthStore } from 'store/auth'

const queryClient = new QueryClient()

const theme: ThemeConfig = {
    cssVar: true
}

function App() {
    useEffect(() => {
        useAuthStore.getState().getSession()
    }, []);
 
    return (
        <ConfigProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ConfigProvider>
    )
}

export default App
