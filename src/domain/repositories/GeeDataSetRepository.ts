import { GeeDataSet } from "../entities/GeeDataSet";

export interface GeeDataSetRepository {
    getAll(): Promise<GeeDataSet[]>;
    getByCode(code: string): Promise<GeeDataSet>;
}
