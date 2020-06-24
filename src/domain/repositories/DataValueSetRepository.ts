import { DataValueSet } from "../entities/DataValueSet";

interface Dhis2Reponse {
    status: "SUCCESS" | "ERROR" | "WARNING";
    description: string;
    importCount: {
        imported: number;
        updated: number;
        ignored: number;
        deleted: number;
    };
}

type FileResponse = string;

export type SaveDataValueSetReponse = Dhis2Reponse | FileResponse;

export default interface DataValueSetRepository {
    save(dataValueSet: DataValueSet): Promise<SaveDataValueSetReponse>;
}
