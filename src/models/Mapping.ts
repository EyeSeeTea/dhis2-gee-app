import _ from "lodash";
import axios, { AxiosBasicCredentials } from "axios";
import Cryptr from "cryptr";
import i18n from "@dhis2/d2-i18n";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type MappingForList = {
    id: string;
    name: string;
    code: string;
    dataSet: string;
    dataElement: string;
    geeImage: string;
    geeBand: string;
    periodAgg: string;
    created: string;
};

export interface Mapping {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string;
    description?: string;
}

export interface MappingPagination {
    page?: number;
    pageSize?: number;
    sorting?: string[];
    paging?: boolean;
}
