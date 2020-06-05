import { ImportRuleRepository } from "../repositories/ImportRuleRepository";
import { Id } from "../entities/Ref";
import MappingRepository, { DeleteByIdError } from "../repositories/MappingRepository";
import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";

export interface DeleteMappingsResult {
    success: number;
    failures: DeleteByIdError[];
}

export class DeleteMappingsUseCase {
    constructor(
        private mappingRepository: MappingRepository,
        private importRuleRepository: ImportRuleRepository
    ) {}

    async execute(ids: Id[]): Promise<DeleteMappingsResult> {
        const deletedIds: Id[] = [];
        const failures: DeleteByIdError[] = [];

        //TODO: create deleteAll in repository
        for (const id of ids) {
            const relatedImportRuleResult = await this.updateRelatedImportRules(id);

            if (relatedImportRuleResult.isSuccess) {
                const result = await this.mappingRepository.deleteById(id);

                result.fold(
                    error => failures.push(error),
                    () => deletedIds.push(id)
                );
            } else {
                failures.push(relatedImportRuleResult.value as UnexpectedError);
            }
        }

        return { success: deletedIds.length, failures };
    }

    private async updateRelatedImportRules(
        mappingIdToDelete: string
    ): Promise<Either<UnexpectedError, true>> {
        const importRules = await this.importRuleRepository.getAll();

        const importRulesWithMappingIdTodelete = importRules.filter(importRule =>
            importRule.selectedMappings.includes(mappingIdToDelete)
        );

        const editedImportRules = importRulesWithMappingIdTodelete.map(importRule => {
            const newSelectedMappings = importRule.selectedMappings.filter(
                mappingId => mappingId !== mappingIdToDelete
            );

            return importRule.updateSelectedMapping(newSelectedMappings);
        });

        return await this.importRuleRepository.saveAll(editedImportRules);
    }
}
