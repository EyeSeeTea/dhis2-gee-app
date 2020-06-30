import { Id, D2Api } from "d2-api";
import i18n from "@dhis2/d2-i18n";
import { TablePagination } from "d2-ui-components";

export interface DataSetData {
    id: Id;
    name: string;
    code: string;
}

export type DataElementField = keyof DataSetData;

function defineGetters(sourceObject: any, targetObject: any) {
    Object.keys(sourceObject).forEach(function (key) {
        Object.defineProperty(targetObject, key, {
            get: () => sourceObject[key],
            enumerable: true,
            configurable: true,
        });
    });
}

class DataSet {
    constructor(public data: DataSet) {
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
        api: D2Api
    ): Promise<{ dataSets: DataSet[] | undefined; pager: Partial<TablePagination> }> {
        const { objects, pager } = await api.models.dataSets
            .get({
                fields: {
                    id: true,
                    name: true,
                    code: true,
                },
            })
            .getData();
        return { dataSets: objects.map(o => o as DataSet), pager: pager };
    }
}

interface DataSet extends DataSetData {}

export default DataSet;
