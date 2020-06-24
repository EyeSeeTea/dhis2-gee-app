import { GlobalOUMapping } from "../entities/GlobalOUMapping";
import { GlobalOUMappingRepository } from "../repositories/GlobalOUMappingRepository";

export class GetGlobalOUMappingsUseCase {
    constructor(private globalOUMappingRepository: GlobalOUMappingRepository) {}

    async execute(): Promise<GlobalOUMapping> {
        return this.globalOUMappingRepository.get();
    }
}
