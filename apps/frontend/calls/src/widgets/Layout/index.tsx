import React, { useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { Layout as AntLayout } from "antd";
import { AxiosError } from "axios";
import { Outlet } from "react-router";

import { useStyles } from "./styles";
import UserMenu from "./UserMenu";

import { useAuthStore } from "../../app/store/auth";
import { userManager } from "../../app/userManager";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const Layout: React.FC = () => {
	const styles = useStyles().styles;

	const user = useAuthStore(state => state.user);

	const { mutateAsync, isPending } = useMutation({
		mutationFn: useAuthStore.getState().getSession,
		onError: async error => {
			if (error instanceof AxiosError && error.status === 401) {
				userManager.signinRedirect();
			}
		}
	});

	useEffect(() => {
		mutateAsync();
	}, [mutateAsync]);

	if (isPending || !user) {
		return <FullSizeLoader />;
	}

	return (
		<AntLayout className={styles.outerLayout}>
			<AntLayout.Header className={styles.header}>
				<div>Calls</div>
				<UserMenu />
			</AntLayout.Header>

			<AntLayout.Content className={styles.content}>
				<Outlet />
			</AntLayout.Content>
		</AntLayout>
	);
};

export default Layout;
