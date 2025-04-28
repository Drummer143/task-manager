import { AdminService } from "@task-manager/zitadel-api/zitadel/admin_pb";
import { AuthService } from "@task-manager/zitadel-api/zitadel/auth_pb";
import { ManagementService } from "@task-manager/zitadel-api/zitadel/management_pb";
import { SystemService } from "@task-manager/zitadel-api/zitadel/system_pb";

import { createClientFor } from "./helpers";

export const createAdminServiceClient = createClientFor(AdminService);
export const createAuthServiceClient = createClientFor(AuthService);
export const createManagementServiceClient = createClientFor(ManagementService);
export const createSystemServiceClient = createClientFor(SystemService);

