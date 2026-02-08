import React, { useEffect, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { Layout as AntLayout } from "antd";
import { AxiosError } from "axios";
import { Outlet } from "react-router";

import NavContent from "./NavContent";
import { useStyles } from "./styles";
import UserMenu from "./UserMenu";
import WorkspaceDeletionBanner from "./WorkspaceDeletionBanner";

import { useAuthStore } from "../../app/store/auth";
import { useChatSocketStore } from "../../app/store/socket";
import { userManager } from "../../app/userManager";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const Layout: React.FC = () => {
	const [collapsed, setCollapsed] = useState(false);

	const styles = useStyles().styles;

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
		userManager.getUser().then(user => {
			if (!user) {
				return;
			}

			useChatSocketStore.getState().getSocket(user.access_token);
		});

		return () => {
			useChatSocketStore.getState().closeSocket();
		};
	}, []);

	if (isPending || !user) {
		return <FullSizeLoader />;
	}

	return (
		<AntLayout className={styles.outerLayout}>
			<AntLayout.Header className={styles.header}>
				header
				<UserMenu />
			</AntLayout.Header>

			<WorkspaceDeletionBanner />

			<AntLayout className={styles.innerLayout}>
				{user.workspace && (
					<AntLayout.Sider
						style={collapsed ? { position: "absolute" } : undefined}
						onCollapse={setCollapsed}
						width={256}
						className={styles.sider}
					>
						<NavContent />
					</AntLayout.Sider>
				)}

				<AntLayout.Content className={styles.content}>
					<Outlet />
				</AntLayout.Content>
			</AntLayout>
		</AntLayout>
	);
};

export default Layout;

