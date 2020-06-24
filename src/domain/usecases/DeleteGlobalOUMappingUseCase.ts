import { Either } from "../common/Either";
import {
    GlobalOUMappingRepository,
    DeleteGlobalOUMappingError,
} from "../repositories/GlobalOUMappingRepository";
import { Id } from "../entities/Ref";

export class DeleteGlobalOUMappingUseCase {
    constructor(private globalOUMappingRepository: GlobalOUMappingRepository) {}

    async execute(orgUnitIds: Id[]): Promise<Either<DeleteGlobalOUMappingError, true>> {
        return this.globalOUMappingRepository.deleteByOrgUnitIds(orgUnitIds);
    }
}
