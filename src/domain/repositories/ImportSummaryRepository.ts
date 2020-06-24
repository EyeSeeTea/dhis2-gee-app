import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";
import { ImportSummary, ImportSummaryData } from "../entities/ImportSummary";
import { Id } from "../entities/Ref";
import { Page, PaginationFilters, Sorting } from "../common/Pagination";

export interface ImportSummaryFilters {
    importRule?: string;
    status?: string;
    pagination?: PaginationFilters;
    sorting?: Sorting<ImportSummaryData>;
}

export type SaveImportSummaryError = UnexpectedError;
export type DeleteImportSummaryByIdsError = UnexpectedError;

export interface ImportSummaryRepository {
    getAll(filters?: ImportSummaryFilters): Promise<Page<ImportSummary>>;
    save(importSummary: ImportSummary): Promise<Either<SaveImportSummaryError, true>>;
    saveAll(importSummary: ImportSummary[]): Promise<Either<SaveImportSummaryError, true>>;
    deleteByIds(ids: Id[]): Promise<Either<DeleteImportSummaryByIdsError, true>>;
}
