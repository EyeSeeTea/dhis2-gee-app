import { ImportRuleData } from "../../../domain/entities/ImportRule";
import { ImportSummaryData } from "../../../domain/entities/ImportSummary";

export interface HistoryState {
    historyRows: ImportSummaryState[];
    importRules: ImportRuleState[];
    current?: ImportSummaryData;
    toDelete: string[];
    selection: { id: string }[];
    statusFilter: string;
    importRuleFilter: string;
    isDeleting: boolean;
    objectsTableKey: number;
}

export type ImportRuleState = ImportRuleData;
export type ImportSummaryState = ImportSummaryData;

export const historyInitialState = {
    historyRows: [],
    importRules: [],
    current: undefined,
    toDelete: [],
    selection: [],
    statusFilter: "",
    importRuleFilter: "",
    isDeleting: false,
    objectsTableKey: new Date().getTime(),
};
