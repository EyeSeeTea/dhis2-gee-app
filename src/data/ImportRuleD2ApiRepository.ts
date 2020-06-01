import {
    ImportRuleRepository,
    ImportRuleFilters,
} from "../domain/repositories/ImportRuleRepository";
import { ImportRule, Mapping } from "../domain/entities/ImportRule";
import DataStore from "d2-api/api/dataStore";
import { PeriodId } from "../domain/entities/PeriodOption";

export default class ImportRuleD2ApiRepository implements ImportRuleRepository {
    constructor(private dataStore: DataStore, private dataStoreKey: string) {}

    async getAll(filters: ImportRuleFilters): Promise<ImportRule[]> {
        const importRulesData = await this.dataStore
            .get<ImportRuleData[]>(this.dataStoreKey)
            .getData();

        if (importRulesData) {
            const importRules = importRulesData?.map(importRuleData => {
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
            });

            const filteredImportRules = this.applyFilters(importRules, filters);

            return filteredImportRules;
        } else {
            return [];
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
