import { RouterProvider } from 'react-router-dom'

import router from './app/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, ThemeConfig } from 'antd'

const queryClient = new QueryClient()

const theme: ThemeConfig = {
    cssVar: true
}

function App() {
    return (
        <ConfigProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ConfigProvider>
    )
}

export default App
