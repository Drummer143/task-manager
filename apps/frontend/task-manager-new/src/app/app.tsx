import { ContextMenu } from "@task-manager/context-menu";
import { RouterProvider } from "react-router";

import router from "./router";

function App() {
	return (
		<ContextMenu>
			<RouterProvider router={router} />
		</ContextMenu>
	);
}

export default App;

