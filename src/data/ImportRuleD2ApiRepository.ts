import moment from "moment";
import {
    ImportRuleRepository,
    ImportRuleFilters,
    DeleteByIdError,
    SaveError,
} from "../domain/repositories/ImportRuleRepository";
import { ImportRule, importRuleDefaultId } from "../domain/entities/ImportRule";
import DataStore from "d2-api/api/dataStore";
import { PeriodId } from "../domain/entities/PeriodOption";
import { Maybe } from "../domain/common/Maybe";
import { Id } from "d2-api";
import { Either } from "../domain/common/Either";
import i18n from "../webapp/utils/i18n";

const defaultImportRuleData: ImportRuleDS = {
    id: importRuleDefaultId,
    name: "Default import",
    description: "Default import. Unique default for all the instance",
    selectedMappings: [],
    selectedOUs: [],
    periodInformation: {
        id: "THIS_YEAR",
        name: i18n.t("This year"),
        start: [0, "year"],
    },
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
};

export default class ImportRuleD2ApiRepository implements ImportRuleRepository {
    private defaultKey: string;
    constructor(
        private dataStore: DataStore,
        private dataStoreKey: string,
        private defaultSuffixKey: string
    ) {
        this.defaultKey = `${importRuleDefaultId}${this.defaultSuffixKey}`;
    }

    async getById(id: Id): Promise<Maybe<ImportRule>> {
        if (id === importRuleDefaultId) {
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

    async save(importRule: ImportRule): Promise<Either<SaveError, true>> {
        try {
            if (importRule.id === importRuleDefaultId) {
                this.saveDefaultData(this.mapToDataStore(importRule));
                return Either.Success(true);
            } else {
                const importRulesData = await this.getImportRulesData();
                const importRuleData = this.mapToDataStore(importRule);

                const exist = importRulesData.find(data => data.id === importRule.id);

                const newimportRulesData = exist
                    ? importRulesData.map(data =>
                          data.id === importRule.id ? importRuleData : data
                      )
                    : [...importRulesData, importRuleData];

                await this.saveImportRulesData(newimportRulesData);

                return Either.Success(true);
            }
        } catch (e) {
            return Either.failure({
                kind: "UnexpectedError",
                error: e,
            });
        }
    }

    private async getDefault(): Promise<ImportRule> {
        const importRuleDataResult = Maybe.fromValue(
            await this.dataStore.get<ImportRuleDS>(this.defaultKey).getData()
        );

        const importRuleData = importRuleDataResult.getOrElse(defaultImportRuleData);

        return this.mapToDomain(importRuleData);
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
            ? filteredBySearchImportRules.filter(importRule =>
                  lastExecuted && importRule.lastExecuted
                      ? moment(lastExecuted).isSameOrBefore(moment(importRule.lastExecuted), "date")
                      : true
              )
            : filteredBySearchImportRules;

        return filteredByLastExecuted;
    }

    private async getImportRulesData(): Promise<ImportRuleDS[]> {
        const data = await this.dataStore.get<ImportRuleDS[]>(this.dataStoreKey).getData();

        return data || [];
    }

    private async saveImportRulesData(imporRulesData: ImportRuleDS[]): Promise<void> {
        this.dataStore.save(this.dataStoreKey, imporRulesData);
    }

    private async saveDefaultData(importRuleData: ImportRuleDS): Promise<void> {
        this.dataStore.save(this.defaultKey, importRuleData);
    }

    private async getDataById(id: string): Promise<Maybe<ImportRuleDS>> {
        const importRulesData = await this.getImportRulesData();

        return Maybe.fromValue(importRulesData.find(importRulesData => importRulesData.id === id));
    }

    private mapToDomain(importRuleData: ImportRuleDS): ImportRule {
        return new ImportRule({
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
        });
    }

    private mapToDataStore(importRule: ImportRule): ImportRuleDS {
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

interface ImportRuleDS {
    id: string;
    name: string;
    code?: string;
    created: string;
    description?: string;
    selectedOUs: string[];
    periodInformation: PeriodOptionDS;
    selectedMappings: string[];
    lastExecuted?: string;
    lastUpdated: string;
}

interface PeriodOptionDS {
    id: string;
    name: string;
    start?: [number, string];
    end?: [number, string];
    startDate?: string;
    endDate?: string;
}
