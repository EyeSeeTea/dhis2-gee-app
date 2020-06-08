import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";
import { ImportSummary } from "../entities/ImportSummary";

export type SaveImportSummaryError = UnexpectedError;

export interface ImportSummaryRepository {
    save(importSummary: ImportSummary): Promise<Either<SaveImportSummaryError, true>>;
}
