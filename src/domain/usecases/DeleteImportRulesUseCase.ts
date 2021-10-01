import { ImportRuleRepository, DeleteImportRulesByIdError } from "../repositories/ImportRuleRepository";
import { Id } from "../entities/Ref";
import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";
import { ImportSummaryRepository } from "../repositories/ImportSummaryRepository";
import i18n from "../../webapp/utils/i18n";

export class DeleteImportRulesUseCase {
    constructor(
        private importRuleRepository: ImportRuleRepository,
        private importSummaryRepository: ImportSummaryRepository
    ) {}

    async execute(ids: Id[]): Promise<Either<DeleteImportRulesByIdError, true>> {
        const relatedImportSummariesResult = await this.updateRelatedImportSummaries(ids);

        if (relatedImportSummariesResult.isSuccess()) {
            return this.importRuleRepository.deleteByIds(ids);
        } else {
            return Either.error({
                kind: "UnexpectedError",
                error: new Error("An error has ocurred updating related import histories"),
            });
        }
    }

    private async updateRelatedImportSummaries(importRulesIdToDelete: Id[]): Promise<Either<UnexpectedError, true>> {
        const importSummaries = await this.importSummaryRepository.getAll();

        const importSummariesWithRulesIdTodelete = importSummaries.items.filter(
            importSummary => importSummary.importRule && importRulesIdToDelete.includes(importSummary.importRule)
        );

        const importRules = await this.importRuleRepository.getAll({ ids: importRulesIdToDelete });

        const editedImportSummaries = importSummariesWithRulesIdTodelete.map(importSummary => {
            const importRule = importRules.find(importRule => importRule.id === importSummary.importRule);

            return importRule
                ? importSummary.updateWithDeletedImportRule(i18n.t("{{name}} (deleted)", importRule))
                : importSummary;
        });

        return await this.importSummaryRepository.saveAll(editedImportSummaries);
    }
}
