import { ImportRuleRepository, SaveError } from "../repositories/ImportRuleRepository";
import { ImportRuleWritableData, ImportRule } from "../entities/ImportRule";
import { Either } from "../common/Either";
import { ValidationErrors } from "../errors/Generic";

export type CreateImportRuleRequest = ImportRuleWritableData;

export type CreateImportRuleError = ValidationErrors | SaveError;

export class CreateImportRuleUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) {}

    async execute(
        createImportRuleRequest: CreateImportRuleRequest
    ): Promise<Either<CreateImportRuleError, true>> {
        const newResult = ImportRule.createNew(createImportRuleRequest);

        if (newResult.isSuccess()) {
            return await this.importRuleRepository.save(newResult.value as ImportRule);
        } else {
            return Either.failure(newResult.value as ValidationErrors);
        }
    }
}
