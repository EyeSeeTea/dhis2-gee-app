import DataStore from "d2-api/api/dataStore";
import { Id } from "d2-api";
import { Mapping } from "../domain/entities/Mapping";
import MappingRepository from "../domain/repositories/MappingRepository";

export default class MappingD2ApiRepository implements MappingRepository {
    constructor(private dataStore: DataStore, private dataStoreKey: string) { }

    async getAll(ids?: Id[]): Promise<Mapping[]> {
        const mappingData = await this.getMappingData();

        const filteredImportRules = ids
            ? mappingData.filter(mapping => ids?.includes(mapping.id))
            : mappingData;

        return filteredImportRules;
    }

    private async getMappingData(): Promise<Mapping[]> {
        const data = await this.dataStore.get<Record<string, Mapping>>(this.dataStoreKey).getData();
        return data ? Object.values(data) : [];
    }
}
