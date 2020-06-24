import { Either } from "../common/Either";
import {
    GlobalOUMappingRepository,
    SaveGlobalOUMappingError,
} from "../repositories/GlobalOUMappingRepository";

export class CreateGlobalOUMappingUseCase {
    constructor(private globalOUMappingRepository: GlobalOUMappingRepository) {}

    async execute(input: {
        [orgUnitPath: string]: string;
    }): Promise<Either<SaveGlobalOUMappingError, true>> {
        const globalOUMapping = Object.keys(input).reduce((acc, ouPath) => {
            const orgUnitId = ouPath.split("/").pop() || "";
            return {
                ...acc,
                [orgUnitId]: {
                    orgUnitPath: ouPath,
                    mappingId: input[ouPath],
                },
            };
        }, {});

        return this.globalOUMappingRepository.save(globalOUMapping);
    }
}
