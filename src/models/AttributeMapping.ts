import { D2Api } from "d2-api";
import _ from "lodash";
import i18n from "../locales";
import { TablePagination } from "d2-ui-components";
import { Config } from "./Config";
import { getDataStore } from "../utils/dhis2";
import { Validation } from "../types/validations";
import { MappingData } from "./Mapping";

export interface AttributeMappingData {
    geeImage: string;
    name: string;
    comment: string;
    dataElement: {
        id: string;
        code: string;
        name: string;
    };
    created: Date;
}

export type AttributeMappingField = keyof AttributeMappingData;

function defineGetters(sourceObject: any, targetObject: any) {
    Object.keys(sourceObject).forEach(function(key) {
        Object.defineProperty(targetObject, key, {
            get: () => sourceObject[key],
            enumerable: true,
            configurable: true,
        });
    });
}

class AttributeMapping {
    data: AttributeMappingData;

    static fieldNames: Record<AttributeMappingField, string> = {
        name: i18n.t("Name"),
        comment: i18n.t("Comment"),
        geeImage: i18n.t("G.E.E Dataset"),
        dataElement: i18n.t("Data element"),
        created: i18n.t("Created at"),
    };

    static getFieldName(field: AttributeMappingField): string {
        return this.fieldNames[field];
    }

    constructor(rawData: AttributeMappingData) {
        this.data = {
            ...rawData,
        };
        defineGetters(this.data, this);
    }

    public static build(attrMapping: AttributeMappingData | undefined): AttributeMapping {
        return attrMapping ? new AttributeMapping(attrMapping) : this.create();
    }

    public static async get(api: D2Api, config: Config, id = " ") {
        const dataStore = getDataStore(api, config);
        const data = await dataStore.get<AttributeMappingData>(id).getData();

        return this.build(data);
    }

    public static create() {
        return new AttributeMapping({
            name: "",
            comment: "",
            geeImage: "",
            dataElement: {
                id: "",
                code: "",
                name: "",
            },
            created: new Date(),
        });
    }
    static async getList(
        api: D2Api,
        config: Config
    ): Promise<{ mappings: AttributeMapping[] | undefined; pager: Partial<TablePagination> }> {
        //TODO: Retrieve proper attribute mappings from Datastore.
        const dataStore = getDataStore(api, config);
        const mappingsKey = config.data.base.dataStore.keys.mappings;
        const mappings = await dataStore.get<AttributeMapping[] | undefined>(mappingsKey).getData();
        return { mappings: mappings ? mappings : [], pager: {} };
    }

    public set<K extends keyof AttributeMappingData>(
        field: K,
        value: AttributeMappingData[K]
    ): AttributeMapping {
        return new AttributeMapping({ ...this.data, [field]: value });
    }

    public async validate(): Promise<Validation> {
        return _.pickBy({
            name: _.compact([
                !this.name.trim()
                    ? {
                          key: "cannotBeBlank",
                          namespace: { field: AttributeMapping.getFieldName("name") },
                      }
                    : null,
            ]),
            geeImage: _.compact([
                !this.geeImage.trim()
                    ? {
                          key: "cannotBeEmpty",
                          namespace: { element: AttributeMapping.getFieldName("geeImage") },
                      }
                    : null,
            ]),
        });
    }
}
interface AttributeMapping extends MappingData {}

export default AttributeMapping;
