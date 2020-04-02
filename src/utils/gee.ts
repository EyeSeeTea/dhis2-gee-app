import { Config } from "../models/Config";
import _ from "lodash";
import { AttributeMappingDictionary } from "../models/Mapping";

export function getDataSetValue(id: string, config: Config, value: string) {
    const ds = _(config.data.base.googleDatasets).get(id);
    return ds ? ds[value] : "";
}

export function getAttributeMappings(
    attributeMappingsDictionary: AttributeMappingDictionary
): Record<string, string> {
    const bandDeMappings = _.mapValues(attributeMappingsDictionary, m => {
        return m.dataElementId ?? "";
    });
    return bandDeMappings;
}
