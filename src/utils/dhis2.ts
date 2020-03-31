import { D2Api, DataValueSetsPostResponse } from "d2-api";
import { Config } from "../models/Config";
import i18n from "../locales";

export function getDataStore(api: D2Api, config: Config) {
    return api.dataStore(config.data.base.dataStore.namespace);
}

export async function getOrgUnitSubtree(api: D2Api, orgUnitId: string): Promise<string[]> {
    const { organisationUnits } = (await api
        .get(`/organisationUnits/${orgUnitId}`, { fields: "id", includeDescendants: true })
        .getData()) as { organisationUnits: { id: string }[] };

    return organisationUnits.map(({ id }) => id);
}

export function getImportCountString(importCount: DataValueSetsPostResponse["importCount"]) {
    return i18n.t("Imported: {{imported}} - updated: {{updated}} - ignored: {{ignored}}", {
        imported: importCount.imported,
        updated: importCount.updated,
        ignored: importCount.ignored,
    });
}
