import DataStore from "d2-api/api/dataStore";
import { Either } from "../domain/common/Either";
import { ImportSummaryStatus, ImportResult, ImportSummary } from "../domain/entities/ImportSummary";
import {
    SaveImportSummaryError,
    ImportSummaryRepository,
} from "../domain/repositories/ImportSummaryRepository";

export default class ImportSummaryD2ApiRepository implements ImportSummaryRepository {
    constructor(private dataStore: DataStore, private dataStoreKey: string) {}

    // async getAll(filters?: ImportRuleFilters): Promise<ImportRule[]> {
    //     const importRulesData = await this.getImportRulesData();

    //     const importRules = importRulesData?.map(importRuleData =>
    //         this.mapToDomain(importRuleData)
    //     );

    //     const filteredImportRules = filters ? this.applyFilters(importRules, filters) : importRules;

    //     return filteredImportRules;
    // }

    async save(importSummary: ImportSummary): Promise<Either<SaveImportSummaryError, true>> {
        try {
            const importSummariesData = await this.getImportSummariesData();
            const importSummaryData = this.mapToDataStore(importSummary);

            const exist = importSummariesData.find(data => data.id === importSummary.id);

            const newImportSummariesData = exist
                ? importSummariesData.map(data =>
                      data.id === importSummary.id ? importSummaryData : data
                  )
                : [...importSummariesData, importSummaryData];

            await this.saveImportSummariesData(newImportSummariesData);
            return Either.Success(true);
        } catch (e) {
            return Either.failure({
                kind: "UnexpectedError",
                error: e,
            });
        }
    }

    // private applyFilters(importRules: ImportRule[], filters: ImportRuleFilters): ImportRule[] {
    //     const { search, lastExecuted } = filters;

    //     const filteredBySearchImportRules = search
    //         ? importRules.filter(
    //             importRule =>
    //                 importRule.name.toLowerCase().includes(search.toLowerCase()) ||
    //                 importRule.description?.toLowerCase().includes(search.toLowerCase()) ||
    //                 importRule.code?.toLowerCase().includes(search.toLowerCase())
    //         )
    //         : importRules;

    //     const filteredByLastExecuted = lastExecuted
    //         ? filteredBySearchImportRules.filter(importRule =>
    //             lastExecuted && importRule.lastExecuted
    //                 ? moment(lastExecuted).isSameOrBefore(moment(importRule.lastExecuted), "date")
    //                 : false
    //         )
    //         : filteredBySearchImportRules;

    //     return filteredByLastExecuted;
    // }

    private async getImportSummariesData(): Promise<ImportSummaryDS[]> {
        const data = await this.dataStore.get<ImportSummaryDS[]>(this.dataStoreKey).getData();

        return data || [];
    }

    private async saveImportSummariesData(imporRulesData: ImportSummaryDS[]): Promise<void> {
        this.dataStore.save(this.dataStoreKey, imporRulesData);
    }

    private mapToDataStore(importSummary: ImportSummary): ImportSummaryDS {
        return {
            id: importSummary.id,
            date: importSummary.date.toISOString(),
            user: importSummary.user,
            status: importSummary.status,
            importRule: importSummary.importRule,
            importRuleLabel: importSummary.importRuleLabel,
            result: importSummary.result,
        };
    }
}

interface ImportSummaryDS {
    readonly id: string;
    readonly date: string;
    readonly user: string;
    readonly status: ImportSummaryStatus;
    readonly importRule?: string;
    readonly importRuleLabel?: string;
    readonly result: ImportResult;
}
