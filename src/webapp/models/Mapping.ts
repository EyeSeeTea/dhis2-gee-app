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
    dataSetId: string;
    dataSetName: string;
    geeImage: string;
    created: Date;
    attributeMappingDictionary: AttributeMappingDictionary;
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
        dataSetId: i18n.t("Instance Dataset"),
        dataSetName: i18n.t("Instance DataSet"),
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
        const mappingsKey = config.data.base.dataStore.keys.mappings;
        const mappingsById = await dataStore
            .get<{ [id: string]: Mapping } | undefined>(mappingsKey)
            .getData();
        return this.build(mappingsById ? mappingsById[id] : undefined);
    }

    public static create() {
        return new Mapping({
            id: generateUid(),
            name: "",
            description: "",
            dataSetId: "",
            dataSetName: "",
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
        const mappings = await dataStore
            .get<{ [id: string]: Mapping } | undefined>(mappingsKey)
            .getData();
        return { mappings: mappings ? _.values(mappings) : [], pager: {} };
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
                          key: "cannotBeBlank",
                          namespace: { element: Mapping.getFieldName("geeImage") },
                      }
                    : null,
            ]),
            dataSet: _.compact([
                !this.dataSetId.trim()
                    ? {
                          key: "cannotBeBlank",
                          namespace: { element: Mapping.getFieldName("dataSetId") },
                      }
                    : null,
            ]),
            attributeMappingDictionary: _.compact([
                _.isEmpty(this.attributeMappingDictionary)
                    ? {
                          key: "cannotBeEmpty",
                          namespace: {
                              element: i18n.t("Google Band mapping with Data Element.q"),
                          },
                      }
                    : null,
            ]),
        });
    }

    public async save(api: D2Api, config: Config) {
        const dataStore = getDataStore(api, config);
        const mappingsKey = config.data.base.dataStore.keys.mappings;
        const mappingsById = await dataStore.get<Mapping[] | undefined>(mappingsKey).getData();
        const newMappingsList = {
            ...mappingsById,
            [this.id]: {
                ...this.data,
                attributeMappingDictionary: _(this.data.attributeMappingDictionary).mapValues(
                    am => am.data
                ),
            },
        };
        await dataStore.save(mappingsKey, newMappingsList).getData();
    }
}

interface Mapping extends MappingData {}

export default Mapping;
