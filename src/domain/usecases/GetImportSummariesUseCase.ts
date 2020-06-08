import {
    ImportSummaryRepository,
    ImportSummaryFilters,
} from "../repositories/ImportSummaryRepository";
import { ImportSummaryData } from "../entities/ImportSummary";

export class GetImportSummariesUseCase {
    constructor(private importSummaryRepository: ImportSummaryRepository) {}

    execute(filters?: ImportSummaryFilters): Promise<ImportSummaryData[]> {
        return this.importSummaryRepository.getAll(filters);
    }
}
