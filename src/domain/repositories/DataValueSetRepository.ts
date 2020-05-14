import { DataValueSet } from "../entities/DataValueSet";

export interface SaveDataValueSetReponse {
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
}

export default interface DataValueSetRepository {
    save(dataValueSet: DataValueSet): Promise<SaveDataValueSetReponse>
} 