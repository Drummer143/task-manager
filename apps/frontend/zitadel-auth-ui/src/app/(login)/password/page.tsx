import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Organization } from "@task-manager/zitadel-api/zitadel/org/v2/org_pb";

import PasswordForm from "../../../components/PasswordForm";
import { getServiceUrlFromHeaders } from "../../../shared/lib/service";
import { loadMostRecentSession } from "../../../shared/lib/session";
import { getDefaultOrg, getLoginSettings } from "../../../shared/lib/zitadel";

interface PageProps {
	searchParams: Promise<Record<string, string | undefined>>;
}

export const metadata: Metadata = {
	title: "Password"
};

const Page: React.FC<PageProps> = async ({ searchParams: promiseSearchParams }) => {
	const searchParams = await promiseSearchParams;

	const { loginName, organization, requestId, sessionId, alt } = searchParams;

	const _headers = await headers();
	const { serviceUrl } = getServiceUrlFromHeaders(_headers);

	let defaultOrganization;

	if (!organization) {
		const org: Organization | null = await getDefaultOrg({
			serviceUrl
		});

		if (org) {
			defaultOrganization = org.id;
		}
	}

	// also allow no session to be found (ignoreUnkownUsername)
	let sessionFactors;

	try {
		sessionFactors = await loadMostRecentSession({
			serviceUrl,
			sessionParams: {
				loginName,
				organization
			}
		});
	} catch (error) {
		// ignore error to continue to show the password form
		console.warn(error);
	}

	const loginSettings = await getLoginSettings({
		serviceUrl,
		organization: organization ?? defaultOrganization
	});

	if (!loginName) {
		return redirect("/loginname");
	}

	return (
		<PasswordForm
			sessionFactor={sessionFactors}
			requestId={requestId}
			organization={organization}
			loginName={loginName}
			sessionId={sessionId}
			loginSettings={loginSettings}
			isAlternative={alt === "true"}
		/>
	);
};

export default Page;

