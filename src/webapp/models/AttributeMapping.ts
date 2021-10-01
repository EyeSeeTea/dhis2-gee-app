import _ from "lodash";
import DataElement from "../../domain/entities/DataElement";
import { D2Api } from "../../types/d2-api";
import { Validation } from "../../types/validations";
import { getDataStore } from "../utils/dhis2";
import i18n from "../utils/i18n";
import { Config } from "./Config";
import { AttributeMappingDictionary } from "./Mapping";

export interface AttributeMappingData {
    id: string;
    geeBand: string;
    comment: string;
    dataElementId?: string;
    dataElementCode?: string;
    dataElementName?: string;
    transformExpression?: string;
}

export type AttributeMappingField = keyof AttributeMappingData;

function defineGetters(sourceObject: any, targetObject: any) {
    Object.keys(sourceObject).forEach(function (key) {
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
        id: i18n.t("Id"),
        comment: i18n.t("Comment"),
        geeBand: i18n.t("Google Attribute"),
        dataElementId: i18n.t("Data element id"),
        dataElementCode: i18n.t("Data element code"),
        dataElementName: i18n.t("Data element name"),
        transformExpression: i18n.t("Transform expression"),
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
            id: "",
            comment: "",
            geeBand: "",
            dataElementId: "",
            dataElementCode: "",
            dataElementName: "",
        });
    }
    public static getList(
        availableBands: string[],
        mappingDictionary: AttributeMappingDictionary
    ): { attributeMappings: AttributeMapping[] } {
        const attributeMappings: AttributeMapping[] = availableBands.map(band =>
            mappingDictionary[band]
                ? AttributeMapping.build(mappingDictionary[band])
                : new AttributeMapping({
                      id: band,
                      geeBand: band,
                      comment: "",
                  })
        );
        return { attributeMappings: attributeMappings };
    }

    public set<K extends keyof AttributeMappingData>(field: K, value: AttributeMappingData[K]): AttributeMapping {
        return new AttributeMapping({ ...this.data, [field]: value });
    }

    public async validate(): Promise<Validation> {
        return _.pickBy({
            geeImage: _.compact([
                !this.geeBand.trim()
                    ? {
                          key: "cannotBeEmpty",
                          namespace: { element: AttributeMapping.getFieldName("geeBand") },
                      }
                    : null,
            ]),
        });
    }

    public setDataElement(dataElement: DataElement) {
        return this.set("dataElementId", dataElement.id)
            .set("dataElementName", dataElement.name)
            .set("dataElementCode", dataElement.code);
    }
}
interface AttributeMapping extends AttributeMappingData {}

export default AttributeMapping;
