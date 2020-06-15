import { GeeDataSet } from "../entities/GeeDataSet";
import { Maybe } from "../common/Maybe";

export interface GeeDataSetRepository {
    getAll(): Promise<GeeDataSet[]>;
    getById(id: string): Promise<Maybe<GeeDataSet>>;
}
