import { Config } from "../models/Config";
import _ from "lodash";

export function getDataSetPointer(id: string, config: Config) {
    const ds = _(config.data.base.googleDatasets).get(id);
    console.log(ds["pointer"]);
    return ds ? ds["pointer"] : "";
}
