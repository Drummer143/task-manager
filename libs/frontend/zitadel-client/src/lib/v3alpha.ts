import { ZITADELUsers } from "@task-manager/zitadel-api/zitadel/resources/user/v3alpha/user_service_pb";
import { ZITADELUserSchemas } from "@task-manager/zitadel-api/zitadel/resources/userschema/v3alpha/user_schema_service_pb";

import { createClientFor } from "./helpers";

export const createUserSchemaServiceClient = createClientFor(ZITADELUserSchemas);
export const createUserServiceClient = createClientFor(ZITADELUsers);

