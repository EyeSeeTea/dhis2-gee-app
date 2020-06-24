import { ImportRuleRepository, ImportRuleFilters } from "../repositories/ImportRuleRepository";
import { ImportRuleData } from "../entities/ImportRule";

export class GetImportRulesUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) {}

    execute(filters?: ImportRuleFilters): Promise<ImportRuleData[]> {
        return this.importRuleRepository.getAll(filters);
    }
}
