import DataStore from "d2-api/api/dataStore";
import { Either } from "../domain/common/Either";
import { ImportSummaryStatus, ImportResult, ImportSummary } from "../domain/entities/ImportSummary";
import {
    SaveImportSummaryError,
    ImportSummaryRepository,
    ImportSummaryFilters,
} from "../domain/repositories/ImportSummaryRepository";
import { UnexpectedError } from "../domain/errors/Generic";
import _ from "lodash";
import { Page } from "../domain/common/Pagination";

export default class ImportSummaryD2ApiRepository implements ImportSummaryRepository {
    constructor(private dataStore: DataStore, private dataStoreKey: string) {}

    async deleteByIds(ids: string[]): Promise<Either<UnexpectedError, true>> {
        try {
            const importSummariesData = await this.getImportSummariesData();

            const newImportSummariesData = importSummariesData.filter(
                importSummary => !ids.includes(importSummary.id)
            );

            await this.saveImportSummariesData(newImportSummariesData);

            return Either.Success(true);
        } catch (e) {
            return Either.failure({
                kind: "UnexpectedError",
                error: e,
            });
        }
    }

    async getAll(filters?: ImportSummaryFilters): Promise<Page<ImportSummary>> {
        console.log({ filters });
        const importSummariesData = await this.getImportSummariesData();

        const importSummaries = importSummariesData?.map(importRuleData =>
            this.mapToDomain(importRuleData)
        );

        const filteredImportSummaries = filters
            ? this.applyFilters(importSummaries, filters)
            : importSummaries;

        const sortedData = filters?.sorting
            ? _.orderBy(filteredImportSummaries, [filters?.sorting.field], [filters?.sorting.order])
            : _.orderBy(filteredImportSummaries, ["date"], ["desc"]);

        const totalItems = sortedData.length;
        const firstItem = filters?.pagination
            ? (filters.pagination.page - 1) * filters.pagination.pageSize
            : 0;
        const lastItem = filters?.pagination ? firstItem + filters.pagination.pageSize : totalItems;
        const items = _.slice(sortedData, firstItem, lastItem);

        return {
            items: items,
            pager: {
                page: filters?.pagination?.page ?? 1,
                pageSize: filters?.pagination?.pageSize ?? totalItems,
                totalItems: totalItems,
            },
        };
    }

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

    async saveAll(importSummaries: ImportSummary[]): Promise<Either<SaveImportSummaryError, true>> {
        try {
            const existedImportSummariesData = await this.getImportSummariesData();

            const importSummariesDataToSave = importSummaries.map(importSummary =>
                this.mapToDataStore(importSummary)
            );

            const existedImportSummariesDataIds = existedImportSummariesData.map(data => data.id);

            const editedImportRulesDataToSave = importSummariesDataToSave.filter(
                importSummaryDataToSave =>
                    existedImportSummariesDataIds.includes(importSummaryDataToSave.id)
            );

            const newImportSummariesDataToSave = importSummariesDataToSave.filter(
                importSummaryDataToSave =>
                    !existedImportSummariesDataIds.includes(importSummaryDataToSave.id)
            );

            const allDataToSave = [
                ...existedImportSummariesData.map(
                    existed =>
                        editedImportRulesDataToSave.find(edited => edited.id === existed.id) ||
                        existed
                ),
                ...newImportSummariesDataToSave,
            ];

            await this.saveImportSummariesData(allDataToSave);

            return Either.Success(true);
        } catch (e) {
            return Either.failure({
                kind: "UnexpectedError",
                error: e,
            });
        }
    }

    private applyFilters(
        importSummaries: ImportSummary[],
        filters: ImportSummaryFilters
    ): ImportSummary[] {
        const { importRule, status } = filters;

        const filteredByImportRules =
            importRule && importRule !== ""
                ? importSummaries.filter(importSummary => importSummary.importRule === importRule)
                : importSummaries;

        const filteredByStatus =
            status && status !== ""
                ? filteredByImportRules.filter(importSummary => importSummary.status === status)
                : filteredByImportRules;

        return filteredByStatus;
    }

    private async getImportSummariesData(): Promise<ImportSummaryDS[]> {
        const data = await this.dataStore.get<ImportSummaryDS[]>(this.dataStoreKey).getData();

        return data || [];
    }

    private async saveImportSummariesData(imporRulesData: ImportSummaryDS[]): Promise<void> {
        this.dataStore.save(this.dataStoreKey, imporRulesData);
    }

    mapToDomain(importRuleData: ImportSummaryDS): ImportSummary {
        return ImportSummary.createExisted({
            ...importRuleData,
            date: new Date(importRuleData.date),
        });
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
