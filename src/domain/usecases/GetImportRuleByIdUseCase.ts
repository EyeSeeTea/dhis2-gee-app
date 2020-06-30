import { ImportRuleRepository } from "../repositories/ImportRuleRepository";
import { Id } from "../entities/Ref";
import { ImportRule } from "../entities/ImportRule";
import { Maybe } from "../common/Maybe";

export class GetImportRuleByIdUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) {}

    async execute(id: Id): Promise<Maybe<ImportRule>> {
        const importRuleResult = await this.importRuleRepository.getById(id);

        return importRuleResult;
    }
}
