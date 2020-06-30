import { ImportRuleData } from "../../../domain/entities/ImportRule";
import { ImportSummaryData } from "../../../domain/entities/ImportSummary";
import i18n from "../../utils/i18n";
import { Page } from "../../../domain/common/Pagination";
import { ImportSummaryFilters } from "../../../domain/repositories/ImportSummaryRepository";

export interface HistoryState {
    history: Page<ImportSummaryState>;
    importRules: ImportRuleState[];
    current?: ImportSummaryData;
    toDelete: string[];
    selection: { id: string }[];
    filters: ImportSummaryFilters;
    isDeleting: boolean;
    objectsTableKey: number;
    statusFilterItems: { id: string; name: string }[];
}

export type ImportRuleState = ImportRuleData;
export type ImportSummaryState = ImportSummaryData;

export const historyInitialState: HistoryState = {
    history: { pager: { page: 1, pageSize: 1, totalItems: 0 }, items: [] },
    importRules: [],
    current: undefined,
    toDelete: [],
    selection: [],
    filters: {
        status: "",
        importRule: "",
        pagination: {
            page: 1,
            pageSize: 25,
        },
        sorting: { field: "date", order: "desc" },
    },
    isDeleting: false,
    objectsTableKey: new Date().getTime(),
    statusFilterItems: [
        {
            id: "SUCCESS",
            name: i18n.t("Success"),
        },
        {
            id: "FAILURE",
            name: i18n.t("Failure"),
        },
    ],
};
