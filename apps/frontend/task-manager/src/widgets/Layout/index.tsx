import React, { useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { lazySuspense } from "@task-manager/react-utils";
import { AxiosError } from "axios";

import { useAuthStore } from "../../app/store/auth";
import { useChatSocketStore } from "../../app/store/socket";
import { userManager } from "../../app/userManager";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const DesktopLayout = lazySuspense(() => import("./Desktop"), <FullSizeLoader />);
// const MobileLayout = lazySuspense(() => import("./Mobile"), <FullSizeLoader />);

const Layout: React.FC = () => {
	// const [mobileLayout, setMobileLayout] = useState(false);

	// useWindowResize("md", setMobileLayout);

	const user = useAuthStore(state => state.user);

	const { mutateAsync, isPending } = useMutation({
		mutationFn: useAuthStore.getState().getSession,
		onError: async (error, vars, ctx) => {
			if (error instanceof AxiosError && error.status === 401) {
				userManager.signinRedirect();
			}
		}
	});

	useEffect(() => {
		mutateAsync();
	}, [mutateAsync]);

	useEffect(() => {
		// const signalsChannel = useNotificationSocketStore.getState().getChannel("signals");

		// signalsChannel.on("message", console.log);

		userManager.getUser().then(user => {
			if (!user) {
				return;
			}

			useChatSocketStore.getState().getSocket(user.access_token);
		});

		return () => {
			useChatSocketStore.getState().closeSocket();
			// useNotificationSocketStore.getState().closeSocket();
		};
	}, []);

	if (isPending || !user) {
		return <FullSizeLoader />;
	}

	return /* mobileLayout ? <MobileLayout /> :  */ <DesktopLayout />;
};

export default Layout;

