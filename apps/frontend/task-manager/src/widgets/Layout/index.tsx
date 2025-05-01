import React, { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { modifyAxiosInstance } from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";

import { userManager } from "../../app/auth";
import { useAuthStore } from "../../app/store/auth";
import { useSocketStore } from "../../app/store/socket";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";
import axios from "axios";

const DesktopLayout = lazySuspense(
	() => import("./Desktop"),
	<FullSizeLoader />
);
// const MobileLayout = lazySuspense(() => import("./Mobile"), <FullSizeLoader />);

const Layout: React.FC = () => {
	// const [mobileLayout, setMobileLayout] = useState(false);
	const [userReady, setUserReady] = useState(false);

	// useWindowResize("md", setMobileLayout);

	useEffect(() => {
		userManager.getUser().then(async user => {
			if (!user || user.expired) {
				const currentUrl = window.location.href;

				userManager.signinRedirect({ state: currentUrl });
			} else {
				modifyAxiosInstance(axios => {
					axios.defaults.headers.common["Authorization"] =
						`${user.token_type} ${user.id_token ?? user.access_token}`;
				});

				useSocketStore.getState().init();

				try {
					try {
						await useAuthStore.getState().getSession();

						setUserReady(true);
					} catch {
						const data = (
							await axios.post(
								`http://localhost:8080/profile/synchronize-zitadel-user/${user.profile.sub}`,
								{},
								{
									headers: {
										Authorization: `${user.token_type} ${user.id_token ?? user.access_token}`
									}
								}
							)
						).data;

						useAuthStore.setState({ user: data });

						setUserReady(true);
					}
				} catch {
					/* empty */
				}
			}
		});
	}, []);

	if (!userReady) {
		return <FullSizeLoader />;
	}

	return /* mobileLayout ? <MobileLayout /> :  */ <DesktopLayout />;
};

export default Layout;

