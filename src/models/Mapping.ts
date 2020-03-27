import { Id, D2Api } from "d2-api";
import _ from "lodash";
import i18n from "../locales";
import { TablePagination } from "d2-ui-components";
import { Config } from "./Config";
import { getDataStore } from "../utils/dhis2";

export interface MappingData {
    id: Id;
    name: string;
    description: string;
    dataSet: string;
    geeImage: string;
    created: Date;
}

export type MappingField = keyof MappingData;

function defineGetters(sourceObject: any, targetObject: any) {
    Object.keys(sourceObject).forEach(function (key) {
        Object.defineProperty(targetObject, key, {
            get: () => sourceObject[key],
            enumerable: true,
            configurable: true,
        });
    });
}

class Mapping {
    data: MappingData;

    static fieldNames: Record<MappingField, string> = {
        id: i18n.t("Id"),
        name: i18n.t("Name"),
        description: i18n.t("Description"),
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

    public static build(mapping: MappingData | undefined): Mapping {
        return mapping ? new Mapping(mapping) : this.create();
    }

    public static async get(api: D2Api, config: Config, id = " ") {
        const dataStore = getDataStore(api, config);
        const data = await dataStore.get<MappingData>(id).getData();

        return this.build(data);
    }

    public static create() {
        return new Mapping({
            id: "",
            name: "",
            description: "",
            dataSet: "",
            geeImage: "",
            created: new Date(),
        });
    }
    static async getList(
        api: D2Api,
        config: Config
    ): Promise<{ mappings: Mapping[] | undefined; pager: Partial<TablePagination> }> {
        const dataStore = getDataStore(api, config);
        const mappingsKey = config.data.base.dataStore.keys.mappings;
        const mappings = await dataStore.get<Mapping[] | undefined>(mappingsKey).getData();
        return { mappings: mappings ? mappings : [], pager: {} };
    }

    public set<K extends keyof MappingData>(field: K, value: MappingData[K]): Mapping {
        return new Mapping({ ...this.data, [field]: value });
    }

    static async delete(api: D2Api, config: Config, mappingsToDelete: string[]) {
        const mappings = await (await Mapping.getList(api, config)).mappings;
        Mapping.saveList(
            api,
            config,
            mappings?.filter(mapping => !mappingsToDelete.includes(mapping.id)) ?? []
        );
    }

    static async saveList(api: D2Api, config: Config, newMappings: Mapping[]) {
        const dataStore = getDataStore(api, config);
        dataStore.save(config.data.base.dataStore.keys.mappings, newMappings);
    }
}

interface Mapping extends MappingData {}

export default Mapping;
