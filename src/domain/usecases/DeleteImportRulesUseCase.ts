import { ImportRuleRepository, DeleteByIdError } from "../repositories/ImportRuleRepository";
import { Id } from "../entities/Ref";

export interface DeleteImportRulesResult {
    success: number;
    failures: DeleteByIdError[];
}

export class DeleteImportRulesUseCase {
    constructor(private importRuleRepository: ImportRuleRepository) {}

    async execute(ids: Id[]): Promise<DeleteImportRulesResult> {
        const deletedIds: Id[] = [];
        const failures: DeleteByIdError[] = [];

        for (const id of ids) {
            const result = await this.importRuleRepository.deleteById(id);
            result.fold(
                error => failures.push(error),
                () => deletedIds.push(id)
            );
        }

        return { success: deletedIds.length, failures };
    }
}
