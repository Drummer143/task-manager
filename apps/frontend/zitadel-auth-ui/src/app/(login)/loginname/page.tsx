import React from "react";

import { Metadata } from "next";
// import { headers as getHeaders } from "next/headers";

// import { Organization } from "@task-manager/zitadel-api/zitadel/org/v2/org_pb";

import UsernameForm from "../../../components/UsernameForm";
// import { getServiceUrlFromHeaders } from "../../../shared/lib/service";
// import {
// 	// getActiveIdentityProviders,
// 	getDefaultOrg
// 	// getLoginSettings
// } from "../../../shared/lib/zitadel";

interface PageProps {
	searchParams: Promise<Record<string | number | symbol, string | undefined>>;
}

export const metadata: Metadata = {
	title: "Login"
};

const Page: React.FC<PageProps> = async ({ searchParams: promiseSearchParams }) => {
	const searchParams = await promiseSearchParams;

	const { loginName, organization, requestId, suffix } = searchParams;
	const submit: boolean = searchParams?.submit === "true";

	// const headers = await getHeaders();
	// const { serviceUrl } = getServiceUrlFromHeaders(headers);

	// let defaultOrganization;

	// if (!organization) {
	// 	const org: Organization | null = await getDefaultOrg({
	// 		serviceUrl
	// 	});

	// 	if (org) {
	// 		defaultOrganization = org.id;
	// 	}
	// }

	// const loginSettings = await getLoginSettings({
	// 	serviceUrl,
	// 	organization: organization ?? defaultOrganization
	// });

	// const contextLoginSettings = await getLoginSettings({
	// 	serviceUrl,
	// 	organization
	// });

	// const identityProviders = await getActiveIdentityProviders({
	// 	serviceUrl,
	// 	orgId: organization ?? defaultOrganization
	// }).then(resp => {
	// 	return resp.identityProviders;
	// });

	return (
		<UsernameForm
			autoSubmit={submit}
			loginName={loginName}
			organization={organization}
			requestId={requestId}
			suffix={suffix}
		/>
	);
};

export default Page;

