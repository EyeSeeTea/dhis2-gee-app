import { Either } from "../common/Either";
import { ImportRule, ImportRuleWritableData } from "../entities/ImportRule";
import { ValidationErrors } from "../errors/Generic";
import { ImportRuleRepository, SaveError } from "../repositories/ImportRuleRepository";

export type CreateImportRuleRequest = ImportRuleWritableData;

export type CreateImportRuleError = ValidationErrors | SaveError;

export class CreateImportRuleUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) {}

    async execute(createImportRuleRequest: CreateImportRuleRequest): Promise<Either<CreateImportRuleError, true>> {
        const newResult = ImportRule.createNew(createImportRuleRequest);

        if (newResult.isSuccess()) {
            return await this.importRuleRepository.save(newResult.value.data);
        } else if (newResult.isError()) {
            return Either.error(newResult.value.error);
        } else {
            return Either.error({ kind: "UnexpectedError", error: new Error("Unknown error") });
        }
    }
}
