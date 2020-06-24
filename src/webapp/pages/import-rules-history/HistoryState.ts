import { ImportRuleData } from "../../../domain/entities/ImportRule";
import { ImportSummaryData } from "../../../domain/entities/ImportSummary";
import i18n from "../../utils/i18n";

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
    statusFilterItems: { id: string; name: string }[];
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
