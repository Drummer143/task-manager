import React, { useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { lazySuspense } from "@task-manager/react-utils";
import { useNavigate } from "react-router";

import { useAuthStore } from "../../app/store/auth";
import { useChatSocketStore, useNotificationSocketStore } from "../../app/store/socket";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const DesktopLayout = lazySuspense(() => import("./Desktop"), <FullSizeLoader />);
// const MobileLayout = lazySuspense(() => import("./Mobile"), <FullSizeLoader />);

const Layout: React.FC = () => {
	// const [mobileLayout, setMobileLayout] = useState(false);

	// useWindowResize("md", setMobileLayout);

	const { getSession, user } = useAuthStore();

	const navigate = useNavigate();

	const { mutateAsync, isPending } = useMutation({
		mutationFn: getSession,
		onError: () => {
			navigate("/login");
		}
	});

	useEffect(() => {
		mutateAsync();
	}, [mutateAsync]);

	useEffect(() => {
		const signalsChannel = useNotificationSocketStore.getState().getChannel("signals");

		signalsChannel.on("message", console.log);

		useChatSocketStore.getState().getSocket();

		return () => {
			useChatSocketStore.getState().closeSocket();
			useNotificationSocketStore.getState().closeSocket();
		};
	}, []);

	if (isPending || !user) {
		return <FullSizeLoader />;
	}

	return /* mobileLayout ? <MobileLayout /> :  */ <DesktopLayout />;
};

export default Layout;

