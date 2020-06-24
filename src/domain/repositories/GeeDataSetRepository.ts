import { GeeDataSet } from "../entities/GeeDataSet";

export interface GeeDataSetRepository {
    getByCode(code: string): Promise<GeeDataSet>;
}
