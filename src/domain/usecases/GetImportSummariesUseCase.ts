import {
    ImportSummaryRepository,
    ImportSummaryFilters,
} from "../repositories/ImportSummaryRepository";
import { ImportSummaryData } from "../entities/ImportSummary";
import { Page } from "../common/Pagination";

export class GetImportSummariesUseCase {
    constructor(private importSummaryRepository: ImportSummaryRepository) {}

    execute(filters?: ImportSummaryFilters): Promise<Page<ImportSummaryData>> {
        return this.importSummaryRepository.getAll(filters);
    }
}
