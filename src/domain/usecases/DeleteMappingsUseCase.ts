import { ImportRuleRepository } from "../repositories/ImportRuleRepository";
import { Id } from "../entities/Ref";
import MappingRepository, { DeleteMappingByIdsError } from "../repositories/MappingRepository";
import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";

export class DeleteMappingsUseCase {
    constructor(
        private mappingRepository: MappingRepository,
        private importRuleRepository: ImportRuleRepository
    ) {}

    async execute(ids: Id[]): Promise<Either<DeleteMappingByIdsError, true>> {
        const relatedImportRulesResult = await this.updateRelatedImportRules(ids);

        if (relatedImportRulesResult.isSuccess()) {
            return await this.mappingRepository.deleteByIds(ids);
        } else {
            return Either.failure({
                kind: "UnexpectedError",
                error: new Error("An error has ocurred removing mapping from related import rules"),
            });
        }
    }

    private async updateRelatedImportRules(
        mappingIdsToDelete: Id[]
    ): Promise<Either<UnexpectedError, true>> {
        const importRules = await this.importRuleRepository.getAll();

        const importRulesWithMappingIdTodelete = importRules.filter(importRule =>
            importRule.selectedMappings.some(mappingId => mappingIdsToDelete.includes(mappingId))
        );

        const editedImportRules = importRulesWithMappingIdTodelete.map(importRule => {
            const newSelectedMappings = importRule.selectedMappings.filter(
                mappingId => !mappingIdsToDelete.includes(mappingId)
            );

            return importRule.updateSelectedMapping(newSelectedMappings);
        });

        return await this.importRuleRepository.saveAll(editedImportRules);
    }
}
