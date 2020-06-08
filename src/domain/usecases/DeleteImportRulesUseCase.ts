import {
    ImportRuleRepository,
    DeleteImportRulesByIdError,
} from "../repositories/ImportRuleRepository";
import { Id } from "../entities/Ref";
import { Either } from "../common/Either";

export class DeleteImportRulesUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) {}

    async execute(ids: Id[]): Promise<Either<DeleteImportRulesByIdError, true>> {
        const result = await this.importRuleRepository.deleteByIds(ids);
        return result;
    }
}
