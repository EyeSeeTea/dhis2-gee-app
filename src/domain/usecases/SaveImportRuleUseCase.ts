import { ImportRuleRepository, SaveError } from "../repositories/ImportRuleRepository";
import {
    ImportRuleWritableData,
    ImportRuleProtectedData,
    ImportRule,
    importRuleDefaultId,
} from "../entities/ImportRule";
import { Either } from "../common/Either";
import { isValidId } from "../entities/Ref";

export type SaveImportRuleRequest = ImportRuleWritableData &
    Partial<Pick<ImportRuleProtectedData, "id">>;

export class SaveImportRuleUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) { }

    async execute(importRuleRequest: SaveImportRuleRequest): Promise<Either<SaveError, true>> {
        if (
            importRuleRequest.id &&
            (isValidId(importRuleRequest.id) || importRuleRequest.id === importRuleDefaultId)
        ) {
            const importRuleToEdit = await this.importRuleRepository.getById(importRuleRequest.id);

            if (importRuleToEdit.isEmpty()) {
                return Either.failure({
                    kind: "ImportRuleIdNotFound",
                    id: importRuleRequest.id,
                });
            }

            const editedImportRule = importRuleToEdit
                .get()
                .changeMappings(importRuleRequest.selectedMappings)
                .changeOUs(importRuleRequest.selectedOUs)
                .changePeriod(importRuleRequest.periodInformation);

            const importRuleResult = await this.importRuleRepository.save(editedImportRule);

            return importRuleResult;
        } else {
            const newImportRule = ImportRule.createNew(importRuleRequest);

            const importRuleResult = await this.importRuleRepository.save(newImportRule);

            return importRuleResult;
        }
    }
}
