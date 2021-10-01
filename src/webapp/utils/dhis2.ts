import { D2Api } from "../../types/d2-api";
import { Config } from "../models/Config";

export function getDataStore(api: D2Api, config: Config) {
    return api.dataStore(config.data.base.dataStore.namespace);
}

export async function getOrgUnitSubtree(api: D2Api, orgUnitId: string): Promise<string[]> {
    const { organisationUnits } = (await api
        .get(`/organisationUnits/${orgUnitId}`, { fields: "id", includeDescendants: true })
        .getData()) as { organisationUnits: { id: string }[] };

    return organisationUnits.map(({ id }) => id);
}
