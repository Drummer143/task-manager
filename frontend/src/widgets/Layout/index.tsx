import React, { useState } from 'react'
import { useWindowResize } from 'shared/hooks/useWindowResize'
import { lazySuspense } from 'shared/HOCs/lazySuspense'
import FullSizeLoader from 'shared/ui/FullSizeLoader'

const DesktopLayout = lazySuspense(() => import('./Desktop'), <FullSizeLoader backgroundColor="var(--ant-color-bg-layout)" />)
const MobileLayout = lazySuspense(() => import('./Mobile'), <FullSizeLoader backgroundColor="var(--ant-color-bg-layout)" />)

const Layout: React.FC = () => {
    const [mobileLayout, setMobileLayout] = useState(false)

    useWindowResize('md', setMobileLayout)

    return mobileLayout ? <MobileLayout /> : <DesktopLayout />
}

export default Layout
