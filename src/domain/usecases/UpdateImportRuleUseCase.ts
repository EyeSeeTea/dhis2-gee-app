import { ImportRuleRepository, SaveError } from "../repositories/ImportRuleRepository";
import {
    ImportRuleWritableData,
    ImportRuleProtectedData,
    importRuleDefaultId,
    ImportRule,
} from "../entities/ImportRule";
import { Either } from "../common/Either";
import { isValidId } from "../entities/Ref";
import { ValidationErrors } from "../errors/Generic";
import { ImportRuleIdNotFound } from "../errors/ImportRule";

export type UpdateImportRuleRequest = ImportRuleWritableData & Pick<ImportRuleProtectedData, "id">;

export type UpdateImportRuleError = ImportRuleIdNotFound | ValidationErrors | SaveError;

export class UpdateImportRuleUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) { }

    async execute(
        importRuleRequest: UpdateImportRuleRequest
    ): Promise<Either<UpdateImportRuleError, true>> {
        this.validateId(importRuleRequest);

        const importRuleToEdit = await this.importRuleRepository.getById(importRuleRequest.id);

        if (importRuleToEdit.isEmpty()) {
            return Either.failure({
                kind: "ImportRuleIdNotFound",
                id: importRuleRequest.id,
            });
        }

        const editResult = importRuleToEdit.get().update(importRuleRequest);

        if (editResult.isSuccess()) {
            return await this.importRuleRepository.save(editResult.value as ImportRule);
        } else {
            return Either.failure(editResult.value as ValidationErrors);
        }
    }

    private validateId(importRuleRequest: UpdateImportRuleRequest) {
        if (!isValidId(importRuleRequest.id) && importRuleRequest.id !== importRuleDefaultId) {
            throw Error(`Invalid import rule id: ${importRuleRequest.id}`);
        }
    }
}
