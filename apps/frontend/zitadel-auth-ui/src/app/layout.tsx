import "@ant-design/v5-patch-for-react-19";
import { App, Layout } from "antd";
import "antd/dist/reset.css";
import { Content } from "antd/es/layout/layout";
// import { headers as getHeaders } from "next/headers";

// import { Organization } from "@task-manager/zitadel-api/zitadel/org/v2/org_pb";

import Providers from "../components/Providers";
// import { getServiceUrlFromHeaders } from "../shared/lib/service";
// import { getBrandingSettings, getDefaultOrg } from "../shared/lib/zitadel";

export const metadata = {
	title: "Auth"
};

interface RootLayoutProps {
	children: React.ReactNode;

	params: Promise<Record<string | number | symbol, string | undefined>>;
}

const RootLayout: React.FC<RootLayoutProps> = async ({ children, params: paramsPromise }) => {
	// const params = await paramsPromise;

	// const organization = params?.organization;

	// let defaultOrganization: string | undefined;

	// const headers = await getHeaders();
	// const { serviceUrl } = getServiceUrlFromHeaders(headers);

	// if (!organization) {
	// 	const org: Organization | null = await getDefaultOrg({
	// 		serviceUrl
	// 	});

	// 	if (org) {
	// 		defaultOrganization = org.id;
	// 	}
	// }

	// const branding = await getBrandingSettings({
	// 	serviceUrl,
	// 	organization: organization ?? defaultOrganization
	// });

	return (
		<html lang="en">
			<head />
			<body>
				<Providers>
					<App style={{ height: "100%" }}>
						<Layout style={{ height: "100%" }}>
							<Content>{children}</Content>
						</Layout>
					</App>
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;

