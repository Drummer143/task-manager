import React, { useState } from "react";

import { lazySuspense } from "shared/HOCs/lazySuspense";
import { useWindowResize } from "shared/hooks/useWindowResize";
import FullSizeLoader from "shared/ui/FullSizeLoader";

const DesktopLayout = lazySuspense(() => import("./Desktop"), <FullSizeLoader />);
const MobileLayout = lazySuspense(() => import("./Mobile"), <FullSizeLoader />);

const Layout: React.FC = () => {
	const [mobileLayout, setMobileLayout] = useState(false);

	useWindowResize("md", setMobileLayout);

	return mobileLayout ? <MobileLayout /> : <DesktopLayout />;
};

export default Layout;
