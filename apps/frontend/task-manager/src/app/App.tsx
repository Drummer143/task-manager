import { useEffect, useRef } from "react";

import { Socket } from "phoenix";
import { RouterProvider } from "react-router";

import router from "./router";

function App() {

	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		socketRef.current = new Socket("ws://localhost:8079/socket", { debug: import.meta.env.DEV });

		socketRef.current.connect();

		const channel = socketRef.current.channel("signals");

		channel.on("refresh", console.debug);

		channel.join();
	}, []);

	return <RouterProvider router={router} />;
}

export default App;

