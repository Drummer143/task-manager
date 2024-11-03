import { RouterProvider } from 'react-router-dom'

import router from './router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, ThemeConfig, App as AntApp, FloatButton, theme as AntTheme } from 'antd'
import { useEffect, useMemo } from 'react'
import { useAuthStore } from 'store/auth'
import { useAppStore } from 'store/app'
import darkThemeConfig from 'shared/antConfigs/darkThemeConfig'
import lightThemeConfig from 'shared/antConfigs/lightThemeConfig'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'

const queryClient = new QueryClient()

function App() {
    const { theme, setTheme, toggleTheme } = useAppStore()

    const themeConfig: ThemeConfig = useMemo(
        () => ({
            ...(theme === 'light' ? lightThemeConfig : darkThemeConfig),
            algorithm: theme === 'light' ? undefined : AntTheme.darkAlgorithm
        }),
        [theme]
    )

    useEffect(() => {
        if (!theme) {
            setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        useAuthStore.getState().getSession()
    }, [])

    return (
        <ConfigProvider theme={themeConfig}>
            <QueryClientProvider client={queryClient}>
                <AntApp className="h-full">
                    <RouterProvider router={router} />

                    <FloatButton
                        icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
                        onClick={toggleTheme}
                    />
                </AntApp>
            </QueryClientProvider>
        </ConfigProvider>
    )
}

export default App
