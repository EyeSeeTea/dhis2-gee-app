import { Either } from "../common/Either";
import { importRuleOndemandId, ImportRuleProtectedData, ImportRuleWritableData } from "../entities/ImportRule";
import { isValidId } from "../entities/Ref";
import { ItemIdNotFoundError, ValidationErrors } from "../errors/Generic";
import { ImportRuleRepository, SaveError } from "../repositories/ImportRuleRepository";

export type UpdateImportRuleRequest = ImportRuleWritableData & Pick<ImportRuleProtectedData, "id">;

export type UpdateImportRuleError = ItemIdNotFoundError | ValidationErrors | SaveError;

export class UpdateImportRuleUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) {}

    async execute(importRuleRequest: UpdateImportRuleRequest): Promise<Either<UpdateImportRuleError, true>> {
        this.validateId(importRuleRequest);

        const importRuleToEdit = await this.importRuleRepository.getById(importRuleRequest.id);

        if (importRuleToEdit.isEmpty()) {
            return Either.error({
                kind: "ItemIdNotFoundError",
                id: importRuleRequest.id,
            });
        }

        const editResult = importRuleToEdit.get().update(importRuleRequest);

        if (editResult.isSuccess()) {
            return await this.importRuleRepository.save(editResult.value.data);
        } else if (editResult.isError()) {
            return Either.error(editResult.value.error);
        } else {
            return Either.error({ kind: "UnexpectedError", error: new Error("Unknown error") });
        }
    }

    private validateId(importRuleRequest: UpdateImportRuleRequest) {
        if (!isValidId(importRuleRequest.id) && importRuleRequest.id !== importRuleOndemandId) {
            throw Error(`Invalid import rule id: ${importRuleRequest.id}`);
        }
    }
}
