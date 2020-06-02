import {
    ImportRuleRepository,
    ImportRuleFilters,
    DeleteByIdError,
} from "../domain/repositories/ImportRuleRepository";
import { ImportRule, Mapping } from "../domain/entities/ImportRule";
import DataStore from "d2-api/api/dataStore";
import { PeriodId, THIS_YEAR } from "../domain/entities/PeriodOption";
import { Maybe } from "../domain/common/Maybe";
import { Id } from "d2-api";
import { Either } from "../domain/common/Either";

const defaultImportData = {
    id: "default",
    name: "Default import",
    description: "Default import. Unique default for all the instance",
    selectedMappings: [],
    selectedOUs: [],
    periodInformation: THIS_YEAR,
    created: new Date(),
    lastUpdated: new Date(),
};

export default class ImportRuleD2ApiRepository implements ImportRuleRepository {
    constructor(
        private dataStore: DataStore,
        private dataStoreKey: string,
        private defaultSuffixKey: string
    ) {}

    async getDefault(): Promise<ImportRule> {
        const importRuleData = Maybe.fromValue(
            await this.dataStore.get<ImportRuleData>(`default${this.defaultSuffixKey}`).getData()
        );

        const importRule = importRuleData.map(this.mapToDomain);

        return importRule.getOrElse(defaultImportData);
    }

    async getById(id: Id): Promise<Maybe<ImportRule>> {
        if (id === "default") {
            return Maybe.fromValue(await this.getDefault());
        } else {
            const importRuleData = await this.getDataById(id);

            return importRuleData.map(this.mapToDomain);
        }
    }

    async getAll(filters: ImportRuleFilters): Promise<ImportRule[]> {
        const importRulesData = await this.getImportRulesData();

        const importRules = importRulesData?.map(importRuleData =>
            this.mapToDomain(importRuleData)
        );

        const filteredImportRules = this.applyFilters(importRules, filters);

        return filteredImportRules;
    }

    async deleteById(id: Id): Promise<Either<DeleteByIdError, true>> {
        const importRulesData = await this.getImportRulesData();

        const importRuleToDelete = importRulesData.find(
            importRulesData => importRulesData.id === id
        );

        if (!importRuleToDelete) {
            return Either.failure({
                kind: "ImportRuleIdNotFound",
                id: id,
            });
        } else {
            try {
                const newimportRulesData = importRulesData.filter(data => data.id !== id);

                await this.saveImportRulesData(newimportRulesData);

                return Either.Success(true);
            } catch (e) {
                return Either.failure({
                    kind: "UnexpectedError",
                    error: e,
                });
            }
        }
    }

    private applyFilters(importRules: ImportRule[], filters: ImportRuleFilters): ImportRule[] {
        const { search, lastExecuted } = filters;

        const filteredBySearchImportRules = search
            ? importRules.filter(
                  importRule =>
                      importRule.name.toLowerCase().includes(search.toLowerCase()) ||
                      importRule.description?.toLowerCase().includes(search.toLowerCase()) ||
                      importRule.code?.toLowerCase().includes(search.toLowerCase())
              )
            : importRules;

        const filteredByLastExecuted = lastExecuted
            ? filteredBySearchImportRules.filter(importRule => {
                  const importRuleTime = importRule.lastExecuted?.getTime() ?? undefined;

                  return importRuleTime ? importRuleTime >= lastExecuted.getTime() : false;
              })
            : filteredBySearchImportRules;

        return filteredByLastExecuted;
    }

    private async getImportRulesData(): Promise<ImportRuleData[]> {
        const data = await this.dataStore.get<ImportRuleData[]>(this.dataStoreKey).getData();

        return data || [];
    }

    private async saveImportRulesData(imporRulesData: ImportRuleData[]): Promise<void> {
        this.dataStore.save(this.dataStoreKey, imporRulesData);
    }

    private async getDataById(id: string): Promise<Maybe<ImportRuleData>> {
        const importRulesData = await this.getImportRulesData();

        return Maybe.fromValue(importRulesData.find(importRulesData => importRulesData.id === id));
    }

    private mapToDomain(importRuleData: ImportRuleData): ImportRule {
        return {
            ...importRuleData,
            created: new Date(importRuleData.created),
            lastUpdated: new Date(importRuleData.lastUpdated),
            lastExecuted: importRuleData.lastExecuted
                ? new Date(importRuleData.lastExecuted)
                : undefined,
            periodInformation: {
                ...importRuleData.periodInformation,
                id: importRuleData.periodInformation.id as PeriodId,
                startDate: importRuleData.periodInformation.startDate
                    ? new Date(importRuleData.periodInformation.startDate)
                    : undefined,
                endDate: importRuleData.periodInformation.endDate
                    ? new Date(importRuleData.periodInformation.endDate)
                    : undefined,
            },
        };
    }

    private mapToDataStore(importRule: ImportRule): ImportRuleData {
        return {
            ...importRule,
            created: importRule.created.toISOString(),
            lastUpdated: importRule.lastUpdated.toISOString(),
            lastExecuted: importRule.lastExecuted
                ? importRule.lastExecuted.toISOString()
                : undefined,
            periodInformation: {
                ...importRule.periodInformation,
                startDate: importRule.periodInformation.startDate
                    ? importRule.periodInformation.startDate.toISOString()
                    : undefined,
                endDate: importRule.periodInformation.endDate
                    ? importRule.periodInformation.endDate.toISOString()
                    : undefined,
            },
        };
    }
}

export interface ImportRuleData {
    id: string;
    name: string;
    code?: string;
    created: string;
    description?: string;
    selectedOUs: string[];
    periodInformation: PeriodOptionData;
    selectedMappings: Mapping[];
    lastExecuted?: string;
    lastUpdated: string;
}

export interface PeriodOptionData {
    id: string;
    name: string;
    start?: [number, string];
    end?: [number, string];
    startDate?: string;
    endDate?: string;
}
