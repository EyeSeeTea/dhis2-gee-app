import { Id, D2Api } from "d2-api";
import { Config } from "./Config";
import i18n from "../locales";
import { TablePagination } from "d2-ui-components";

export interface DataElementData {
    id: Id;
    name: string;
    code: string;
}

export interface SelectionInfo {
    selected?: DataElement[];
    messages?: string[];
}

export type DataElementField = keyof DataElementData;

function defineGetters(sourceObject: any, targetObject: any) {
    Object.keys(sourceObject).forEach(function (key) {
        Object.defineProperty(targetObject, key, {
            get: () => sourceObject[key],
            enumerable: true,
            configurable: true,
        });
    });
}

class DataElement {
    constructor(private api: D2Api, private config: Config, public data: DataElement) {
        defineGetters(this.data, this);
    }

    static fieldNames: Record<DataElementField, string> = {
        id: i18n.t("Id"),
        name: i18n.t("Name"),
        code: i18n.t("Code"),
    };

    static getFieldName(field: DataElementField): string {
        return this.fieldNames[field];
    }

    static async getList(
        api: D2Api,
        datasetId: string
    ): Promise<{ dataElements: DataElement[] | undefined; pager: Partial<TablePagination> }> {
        const { objects, pager } = await api.models.dataElements
            .get({
                fields: {
                    id: true,
                    name: true,
                    code: true,
                },
                filter: {
                    "dataSetElements.dataSet.id": { eq: datasetId },
                },
            })
            .getData();
        return { dataElements: objects.map(o => o as DataElement), pager: pager };
    }
}

interface DataElement extends DataElementData {}

export default DataElement;
