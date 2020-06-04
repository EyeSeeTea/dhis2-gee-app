import { ImportRuleRepository, SaveError } from "../repositories/ImportRuleRepository";
import { ImportRule } from "../entities/ImportRule";
import { Either } from "../common/Either";

export class SaveImportRuleUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) {}

    async execute(importRule: ImportRule): Promise<Either<SaveError, true>> {
        const importRuleResult = await this.importRuleRepository.save(importRule);

        return importRuleResult;
    }
}
