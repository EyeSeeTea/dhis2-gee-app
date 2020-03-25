import { Id, D2Api } from "d2-api";
import { Moment } from "moment";
import i18n from "../locales";
import { TableSorting, TablePagination } from "d2-ui-components";
import { Filter } from "d2-api/api/common";
import { Config } from "./Config";
import { getDataStore } from "../utils/dhis2";

export interface MappingData {
    id: Id;
    name: string;
    dataSet: string;
    geeImage: string;
    created: Moment | undefined;
}

export type MappingField = keyof MappingData;

function defineGetters(sourceObject: any, targetObject: any) {
    Object.keys(sourceObject).forEach(function(key) {
        Object.defineProperty(targetObject, key, {
            get: () => sourceObject[key],
            enumerable: true,
            configurable: true,
        });
    });
}
        });
    });
}

class Mapping {
    data: MappingData;

    static fieldNames: Record<MappingField, string> = {
        id: i18n.t("Id"),
        name: i18n.t("Name"),
        dataSet: i18n.t("Instance Dataset"),
        geeImage: i18n.t("G.E.E Dataset"),
        created: i18n.t("Created at"),
    };

    static getFieldName(field: MappingField): string {
        return this.fieldNames[field];
    }

    constructor(rawData: MappingData) {
        this.data = {
            ...rawData,
        };
        defineGetters(this.data, this);
    }

    static async getList(
        api: D2Api,
        config: Config,
        filters: Filter,
        sorting: TableSorting<Mapping>,
        pagination: { page: number; pageSize: number }
    ): Promise<{ mappings: Mapping[] | undefined; pager: Partial<TablePagination> }> {
        const dataStore = getDataStore(api, config);
        const mappingsKey = config.data.base.dataStore.keys.mappings;
        const mappings = await dataStore.get<Mapping[] | undefined>(mappingsKey).getData();
        return { mappings: mappings ? mappings : [], pager: {} };
    }
}

interface Mapping extends MappingData {}

export default Mapping;