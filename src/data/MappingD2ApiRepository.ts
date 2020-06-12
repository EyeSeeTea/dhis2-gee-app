import DataStore from "d2-api/api/dataStore";
import { Id } from "d2-api";
import { Mapping } from "../domain/entities/Mapping";
import MappingRepository, {
    DeleteMappingByIdsError,
} from "../domain/repositories/MappingRepository";
import { Either } from "../domain/common/Either";
import _ from "lodash";
import { TransformExpression } from "../domain/entities/TransformExpression";

export default class MappingD2ApiRepository implements MappingRepository {
    constructor(private dataStore: DataStore, private dataStoreKey: string) { }

    async getAll(ids?: Id[]): Promise<Mapping[]> {
        const mappingData = await this.getMappingData();

        const filteredImportRules = ids
            ? mappingData.filter(mapping => ids?.includes(mapping.id))
            : mappingData;

        return filteredImportRules.map(this.mapToDomain);
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

    private async getMappingData(): Promise<MappingDS[]> {
        const data = await this.dataStore
            .get<Record<string, MappingDS>>(this.dataStoreKey)
            .getData();
        return data ? Object.values(data) : [];
    }

    private async saveMappingData(mappingList: MappingDS[]): Promise<void> {
        const mappindData = mappingList.reduce((acc, mapping) => {
            return { ...acc, [mapping.id]: mapping };
        }, {});

        this.dataStore.save(this.dataStoreKey, mappindData);
    }

    private mapToDomain(mappingData: MappingDS): Mapping {
        return {
            ...mappingData,
            created: new Date(mappingData.created),
            isDefault: mappingData.isDefault ?? false,
            attributeMappingDictionary: _(mappingData.attributeMappingDictionary)
                .mapValues(attributeMapping => {
                    const transformExpresion = attributeMapping.transformExpression
                        ? TransformExpression.create(attributeMapping.transformExpression).fold(
                            () => {
                                throw new Error(
                                    "Unexpected invalid transform espression in the data store"
                                );
                            },
                            espression => espression
                        )
                        : undefined;

                    return {
                        ...attributeMapping,
                        transformExpression: transformExpresion,
                    };
                })
                .value(),
        };
    }
}

export interface MappingDS {
    id: Id;
    name: string;
    description: string;
    dataSetId: string;
    dataSetName: string;
    geeImage: string;
    created: string;
    attributeMappingDictionary: AttributeMappingDictionaryDS;
    isDefault: boolean;
}

export interface AttributeMappingDictionaryDS {
    [geeBand: string]: AttributeMappingDS;
}

export interface AttributeMappingDS {
    id: string;
    geeBand: string;
    comment: string;
    dataElementId?: string;
    dataElementCode?: string;
    dataElementName?: string;
    transformExpression?: string;
}
