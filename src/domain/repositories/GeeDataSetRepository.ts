import { GeeDataSet } from "../entities/GeeDataSet";
import { Maybe } from "../common/Maybe";

export type GeeDataSetsFilter = {
    search: string;
    cadence: string;
};

export interface GeeDataSetRepository {
    getAll(filter?: GeeDataSetsFilter): Promise<GeeDataSet[]>;
    getById(id: string): Promise<Maybe<GeeDataSet>>;
}
