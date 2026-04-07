import { D2Api } from "@eyeseetea/d2-api/2.41";
import { getMockApiFromClass } from "@eyeseetea/d2-api";

/** Named re-exports: `export *` from the 2.41 entry breaks under Vite (CJS interop). */
export { D2Api };
export type { D2ApiDefinition, MetadataPick, MetadataPayload } from "@eyeseetea/d2-api/2.41";
export * from "@eyeseetea/d2-api/api/index";
export * from "@eyeseetea/d2-api/2.41/schemas";

export const getMockApi = getMockApiFromClass(D2Api);
