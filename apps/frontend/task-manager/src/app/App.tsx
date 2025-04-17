import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import router from "./router";
import { useSocketStore } from "./store/socket";

import { useAuthStore } from "../app/store/auth";
import FullSizeLoader from "../shared/ui/FullSizeLoader";

function App() {
	const { isLoading } = useQuery({
		queryFn: useAuthStore.getState().getSession,
		queryKey: ["profile"]
	});

	useEffect(() => {
		useAuthStore.getState().getSession();

		useSocketStore.getState().init();
	}, []);

	return isLoading ? <FullSizeLoader /> : <RouterProvider router={router} />;
}

export default App;