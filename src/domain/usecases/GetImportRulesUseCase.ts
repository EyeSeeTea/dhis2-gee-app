import { ImportRuleRepository, ImportRuleFilters } from "../repositories/ImportRuleRepository";
import { ImportRule } from "../entities/ImportRule";

export class GetImportRulesUseCase implements GetImportRulesUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) { }

    execute(filters?: ImportRuleFilters): Promise<ImportRule[]> {
        return this.importRuleRepository.getAll(filters);
    }
}

