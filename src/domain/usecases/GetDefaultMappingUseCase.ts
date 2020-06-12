import MappingRepository from "../repositories/MappingRepository";
import { Mapping } from "../entities/Mapping";

export class GetDefaultMappingUseCase {
    constructor(private mappingRepository: MappingRepository) {}

    async execute(): Promise<Mapping | undefined> {
        const mappings = await this.mappingRepository.getAll();

        return mappings.find(mapping => mapping.isDefault);
    }
}
