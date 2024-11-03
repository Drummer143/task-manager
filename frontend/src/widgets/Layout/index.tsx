import React, { useState } from 'react'
import { useWindowResize } from 'shared/hooks/useWindowResize'
import { lazySuspense } from 'shared/HOCs/lazySuspense'
import FullSizeLoader from 'shared/ui/FullSizeLoader'

const DesktopLayout = lazySuspense(() => import('./Desktop'), <FullSizeLoader />)
const MobileLayout = lazySuspense(() => import('./Mobile'), <FullSizeLoader />)

const Layout: React.FC = () => {
    const [mobileLayout, setMobileLayout] = useState(false)

    useWindowResize('md', setMobileLayout)

    return mobileLayout ? <MobileLayout /> : <DesktopLayout />
}

export default Layout
