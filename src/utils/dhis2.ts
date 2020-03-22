import { D2Api } from "d2-api";
import { Config } from "../models/Config";

export function getDataStore(api: D2Api, config: Config) {
    return api.dataStore(config.data.base.dataStore.namespace);
}
