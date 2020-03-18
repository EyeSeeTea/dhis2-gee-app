import _ from "lodash";
import { Id, D2Api } from "d2-api";
import moment, { Moment } from "moment";
import axios, { AxiosBasicCredentials } from "axios";
import Cryptr from "cryptr";
import i18n from "@dhis2/d2-i18n";
import { Config } from "./Config";
import { TableSorting, TablePagination } from "d2-ui-components";
import { Filter } from "d2-api/api/common";
//TODO import MappingList, { FiltersForList, MappingForList } from "./MappingForList";
//import generateUid from "d2/uid";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface MappingData {
    id: Id;
    name: string;
    code: string;
    dataSet: string;
    dataElement: string;
    geeImage: string;
    geeBand: string;
    created: Moment | undefined;
}

const defaultMappingData = {
    id: undefined,
    name: "",
    code: "",
    dataSet: "",
    dataElement: "",
    geeImage: "",
    geeBand: "",
    periodAgg: "",
    created: undefined,
};

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
        code: i18n.t("Code"),
        dataSet: i18n.t("Instance Dataset"),
        dataElement: i18n.t("Instance DataElement"),
        geeImage: i18n.t("G.E.E Dataset"),
        geeBand: i18n.t("G.E.E Attribute"),
        created: i18n.t("Created at"),
    };

    static getFieldName(field: MappingField): string {
        return this.fieldNames[field];
    }

    constructor(public api: D2Api, public config: Config, rawData: MappingData) {
        this.data = {
            ...rawData,
        };
        defineGetters(this.data, this)
    }

    static async getList(
        api: D2Api,
        config: Config,
        filters: Filter,
        sorting: TableSorting<Mapping>,
        pagination: { page: number; pageSize: number }
    ): Promise<{ objects: Mapping[]; pager: Partial<TablePagination> }> {
        const rows: Mapping[] = [
            new Mapping(api, config, {
                id: "Mapping1",
                name: "Mapping1",
                code: "Mapping1",
                dataSet: "DS1",
                dataElement: "DE1",
                geeImage: "GEE",
                geeBand: "GEE",
                created: moment(),
            }),
        ];

        return { objects: rows, pager: {} };
    }
}

interface Mapping extends MappingData {}

export default Mapping;
