import { Config } from "../models/Config";
import _ from "lodash";

export function getDataSetPointer(id: string, config: Config) {
    const ds = _(config.data.base.googleDatasets).get(id);
    return ds ? ds["pointer"] : "";
}
