import DataStore from "d2-api/api/dataStore";
import { Id } from "d2-api";
import { Mapping } from "../domain/entities/Mapping";
import MappingRepository, {
    DeleteMappingByIdsError,
} from "../domain/repositories/MappingRepository";
import { Either } from "../domain/common/Either";

export default class MappingD2ApiRepository implements MappingRepository {
    constructor(private dataStore: DataStore, private dataStoreKey: string) {}

    async getAll(ids?: Id[]): Promise<Mapping[]> {
        const mappingData = await this.getMappingData();

        const filteredImportRules = ids
            ? mappingData.filter(mapping => ids?.includes(mapping.id))
            : mappingData;

        return filteredImportRules;
    }

    async deleteByIds(ids: string[]): Promise<Either<DeleteMappingByIdsError, true>> {
        try {
            const mappingData = await this.getMappingData();

            const newMappingData = mappingData.filter(mapping => !ids.includes(mapping.id));

            await this.saveMappingData(newMappingData);

            return Either.Success(true);
        } catch (e) {
            return Either.failure({
                kind: "UnexpectedError",
                error: e,
            });
        }
    }

    private async getMappingData(): Promise<Mapping[]> {
        const data = await this.dataStore.get<Record<string, Mapping>>(this.dataStoreKey).getData();
        return data ? Object.values(data) : [];
    }

    private async saveMappingData(mappingList: Mapping[]): Promise<void> {
        const mappindData = mappingList.reduce((acc, mapping) => {
            return { ...acc, [mapping.id]: mapping };
        }, {});

        this.dataStore.save(this.dataStoreKey, mappindData);
    }
}
