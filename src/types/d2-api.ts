import { D2Api } from "@eyeseetea/d2-api/2.41";
import { getMockApiFromClass } from "@eyeseetea/d2-api";

export * from "@eyeseetea/d2-api/2.41";
export const getMockApi = getMockApiFromClass(D2Api);
