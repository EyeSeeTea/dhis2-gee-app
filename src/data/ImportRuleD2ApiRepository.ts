import {
    ImportRuleRepository,
    ImportRuleFilters,
} from "../domain/repositories/ImportRuleRepository";
import { ImportRule, Mapping } from "../domain/entities/ImportRule";
import DataStore from "d2-api/api/dataStore";
import { PeriodId, THIS_YEAR } from "../domain/entities/PeriodOption";
import { Maybe } from "../domain/common/Maybe";
import { Id } from "d2-api";

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
            const importRulesData = await this.getImportRulesData();

            const importRuleData = Maybe.fromValue(
                importRulesData.find(importRulesData => importRulesData.id === id)
            );

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

    private async getImportRulesData(): Promise<ImportRuleData[]> {
        const data = await this.dataStore.get<ImportRuleData[]>(this.dataStoreKey).getData();

        return data || [];
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
