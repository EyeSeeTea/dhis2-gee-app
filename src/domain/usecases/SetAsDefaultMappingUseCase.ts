import MappingRepository, { SaveMappingError } from "../repositories/MappingRepository";
import { Id } from "../entities/Ref";
import { Either } from "../common/Either";

export class SetAsDefaultMappingUseCase {
    constructor(private mappingRepository: MappingRepository) {}

    async execute(mappingId: Id): Promise<Either<SaveMappingError, true>> {
        const mappings = await this.mappingRepository.getAll();

        const editedMappings = mappings.map(mapping => {
            return { ...mapping, isDefault: mapping.id === mappingId };
        });

        const result = await this.mappingRepository.saveAll(editedMappings);

        return result;
    }
}
