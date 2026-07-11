import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@task-manager/api/main";
import { Layout } from "antd";
import { Outlet } from "react-router";

import styles from "./styles.module.scss";
import SideBar from "./widgets/SideBar";

import { reactQueryTags } from "../../shared/reactQueryTags";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const BaseLayout: React.FC = () => {
	const { isLoading, error } = useQuery({
		queryKey: reactQueryTags.profile,
		queryFn: () => getProfile()
	});

	if (isLoading) {
		return <FullSizeLoader />;
	}

	return (
		<Layout className={styles.layout}>
			<Layout.Sider width="64px" className={styles.sider}>
				<SideBar />
			</Layout.Sider>

			<Layout.Content>
				<Outlet />
			</Layout.Content>
		</Layout>
	);
};

export default BaseLayout;

