import { Id, D2Api } from "d2-api";
import _ from "lodash";
import i18n from "../locales";
import { TablePagination } from "d2-ui-components";
import { Config } from "./Config";
import { getDataStore } from "../utils/dhis2";
import { Validation } from "../types/validations";
import AttributeMapping from "./AttributeMapping";
import { generateUid } from "d2/uid";

export interface AttributeMappingDictionary {
    [geeBand: string]: AttributeMapping;
}

export interface MappingData {
    id: Id;
    name: string;
    description: string;
    dataSet: string;
    geeImage: string;
    created: Date;
    attributeMappingDictionary: AttributeMappingDictionary;
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

class Mapping {
    data: MappingData;

    static fieldNames: Record<MappingField, string> = {
        id: i18n.t("Id"),
        name: i18n.t("Name"),
        description: i18n.t("Description"),
        dataSet: i18n.t("Instance Dataset"),
        geeImage: i18n.t("G.E.E Dataset"),
        created: i18n.t("Created at"),
        attributeMappingDictionary: i18n.t("Attribute mappings"),
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
            id: generateUid(),
            name: "",
            description: "",
            dataSet: "",
            geeImage: "",
            attributeMappingDictionary: {},
            created: new Date(),
        });
    }
    static async getList(
        api: D2Api,
        config: Config
    ): Promise<{ mappings: Mapping[] | undefined; pager: Partial<TablePagination> }> {
        const dataStore = getDataStore(api, config);
        const mappingsKey = config.data.base.dataStore.keys.mappings;
        const mappingsById = await dataStore.get<Mapping[] | undefined>(mappingsKey).getData();
        return { mappings: mappingsById ? mappingsById.map(m => m) : [], pager: {} };
    }

    public set<K extends keyof MappingData>(field: K, value: MappingData[K]): Mapping {
        return new Mapping({ ...this.data, [field]: value });
    }

    public async validate(): Promise<Validation> {
        return _.pickBy({
            name: _.compact([
                !this.name.trim()
                    ? {
                          key: "cannotBeBlank",
                          namespace: { field: Mapping.getFieldName("name") },
                      }
                    : null,
            ]),
            geeImage: _.compact([
                !this.geeImage.trim()
                    ? {
                          key: "cannotBeEmpty",
                          namespace: { element: Mapping.getFieldName("geeImage") },
                      }
                    : null,
            ]),
        });
    }

    public async save(api: D2Api, config: Config) {
        const dataStore = getDataStore(api, config);
        const mappingsKey = config.data.base.dataStore.keys.mappings;
        const mappingsById = await dataStore.get<Mapping[] | undefined>(mappingsKey).getData();
        return await dataStore.save(mappingsKey, { ...mappingsById, [this.id]: this });
    }
}

interface Mapping extends MappingData {}

export default Mapping;
