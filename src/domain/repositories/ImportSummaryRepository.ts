import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";
import { ImportSummary } from "../entities/ImportSummary";
import { Id } from "../entities/Ref";

export interface ImportSummaryFilters {
    importRule?: string;
    status?: string;
}

export type SaveImportSummaryError = UnexpectedError;
export type DeleteImportSummaryByIdsError = UnexpectedError;

export interface ImportSummaryRepository {
    getAll(filters?: ImportSummaryFilters): Promise<ImportSummary[]>;
    save(importSummary: ImportSummary): Promise<Either<SaveImportSummaryError, true>>;
    saveAll(importSummary: ImportSummary[]): Promise<Either<SaveImportSummaryError, true>>;
    deleteByIds(ids: Id[]): Promise<Either<DeleteImportSummaryByIdsError, true>>;
}
