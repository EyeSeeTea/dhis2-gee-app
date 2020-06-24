import { Id } from "../entities/Ref";
import { Either } from "../common/Either";
import {
    DeleteImportSummaryByIdsError,
    ImportSummaryRepository,
} from "../repositories/ImportSummaryRepository";

export class DeleteImportSummariesUseCase {
    constructor(private importRuleRepository: ImportSummaryRepository) {}

    async execute(ids: Id[]): Promise<Either<DeleteImportSummaryByIdsError, true>> {
        const result = await this.importRuleRepository.deleteByIds(ids);

        return result;
    }
}
