import DataStore from "d2-api/api/dataStore";
import { Id } from "d2-api";
import { Either } from "../domain/common/Either";
import {
    GlobalOUMappingRepository,
    SaveGlobalOUMappingError,
    DeleteGlobalOUMappingError,
} from "../domain/repositories/GlobalOUMappingRepository";
import { GlobalOUMapping } from "../domain/entities/GlobalOUMapping";

export default class GlobalOUMappingD2ApiRepository implements GlobalOUMappingRepository {
    constructor(private dataStore: DataStore, private dataStoreKey: string) {}

    async get(): Promise<GlobalOUMapping> {
        const globalOrgUnitMappings = await this.getGlobalOrgUnitMappingsData();

        return globalOrgUnitMappings;
    }

    async getByMappingId(mappingId: Id): Promise<GlobalOUMapping> {
        const globalOrgUnitMappings = await this.getGlobalOrgUnitMappingsData();

        const globalOrgUnitMappingsFiltered: GlobalOUMapping = Object.entries(globalOrgUnitMappings)
            .filter(([, v]) => v.mappingId === mappingId)
            .reduce((acc, [k, v]) => {
                return { ...acc, [k]: v };
            }, {});

        return globalOrgUnitMappingsFiltered;
    }

    async save(
        globalOrgUnitMappingsToSave: GlobalOUMapping
    ): Promise<Either<SaveGlobalOUMappingError, true>> {
        try {
            const globalOrgUnitMappings = await this.getGlobalOrgUnitMappingsData();

            Object.entries(globalOrgUnitMappingsToSave).forEach(
                ([k, v]) => (globalOrgUnitMappings[k] = v)
            );

            this.saveGlobalOrgUnitMappingsData(globalOrgUnitMappings);
            return Either.Success(true);
        } catch (e) {
            return Either.failure({
                kind: "UnexpectedError",
                error: e,
            });
        }
    }

    async deleteByOrgUnitIds(orgUnitIds: Id[]): Promise<Either<DeleteGlobalOUMappingError, true>> {
        try {
            const globalOrgUnitMappings = await this.getGlobalOrgUnitMappingsData();

            const globalOrgUnitMappingsFiltered = Object.entries(globalOrgUnitMappings)
                .filter(([k]) => !orgUnitIds.includes(k))
                .reduce((acc, [k, v]) => {
                    return { ...acc, [k]: v };
                }, {});

            this.saveGlobalOrgUnitMappingsData(globalOrgUnitMappingsFiltered);

            return Either.Success(true);
        } catch (e) {
            return Either.failure({
                kind: "UnexpectedError",
                error: e,
            });
        }
    }
    async deleteByMappingIds(mappingIds: Id[]): Promise<Either<DeleteGlobalOUMappingError, true>> {
        try {
            const globalOrgUnitMappings = await this.getGlobalOrgUnitMappingsData();

            const globalOrgUnitMappingsFiltered = Object.entries(globalOrgUnitMappings)
                .filter(([, v]) => !mappingIds.includes(v.mappingId))
                .reduce((acc, [k, v]) => {
                    return { ...acc, [k]: v };
                }, {});

            this.saveGlobalOrgUnitMappingsData(globalOrgUnitMappingsFiltered);

            return Either.Success(true);
        } catch (e) {
            return Either.failure({
                kind: "UnexpectedError",
                error: e,
            });
        }
    }

    private async getGlobalOrgUnitMappingsData(): Promise<GlobalOUMapping> {
        const data = await this.dataStore.get<GlobalOUMapping>(this.dataStoreKey).getData();

        return data || {};
    }

    private async saveGlobalOrgUnitMappingsData(imporRulesData: GlobalOUMapping): Promise<void> {
        this.dataStore.save(this.dataStoreKey, imporRulesData);
    }
}
