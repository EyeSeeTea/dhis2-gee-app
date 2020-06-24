import { GlobalOUMapping } from "../entities/GlobalOUMapping";
import { GlobalOUMappingRepository } from "../repositories/GlobalOUMappingRepository";
import { Id } from "../entities/Ref";

export class GetGlobalOUMappingByMappingIdUseCase {
    constructor(private globalOUMappingRepository: GlobalOUMappingRepository) {}

    async execute(mappingId: Id): Promise<GlobalOUMapping> {
        return this.globalOUMappingRepository.getByMappingId(mappingId);
    }
}
