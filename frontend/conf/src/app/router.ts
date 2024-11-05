import { createBrowserRouter } from "react-router-dom";

import { lazySuspense } from "shared/HOCs/lazySuspense";

const Home = lazySuspense(() => import("pages/Home"));

export default createBrowserRouter([
	{
		path: "/",
		Component: Home
	}
]);
