import { create } from "@bufbuild/protobuf";
import { FeatureService } from "@task-manager/zitadel-api/zitadel/feature/v2/feature_service_pb";
import { IdentityProviderService } from "@task-manager/zitadel-api/zitadel/idp/v2/idp_service_pb";
import { RequestContextSchema } from "@task-manager/zitadel-api/zitadel/object/v2/object_pb";
import { OIDCService } from "@task-manager/zitadel-api/zitadel/oidc/v2/oidc_service_pb";
import { OrganizationService } from "@task-manager/zitadel-api/zitadel/org/v2/org_service_pb";
import { SAMLService } from "@task-manager/zitadel-api/zitadel/saml/v2/saml_service_pb";
import { SessionService } from "@task-manager/zitadel-api/zitadel/session/v2/session_service_pb";
import { SettingsService } from "@task-manager/zitadel-api/zitadel/settings/v2/settings_service_pb";
import { UserService } from "@task-manager/zitadel-api/zitadel/user/v2/user_service_pb";

import { createClientFor } from "./helpers";

export const createUserServiceClient = createClientFor(UserService);
export const createSettingsServiceClient = createClientFor(SettingsService);
export const createSessionServiceClient = createClientFor(SessionService);
export const createOIDCServiceClient = createClientFor(OIDCService);
export const createSAMLServiceClient = createClientFor(SAMLService);
export const createOrganizationServiceClient = createClientFor(OrganizationService);
export const createFeatureServiceClient = createClientFor(FeatureService);
export const createIdpServiceClient = createClientFor(IdentityProviderService);

export function makeReqCtx(orgId: string | undefined) {
	return create(RequestContextSchema, {
		resourceOwner: orgId ? { case: "orgId", value: orgId } : { case: "instance", value: true }
	});
}

