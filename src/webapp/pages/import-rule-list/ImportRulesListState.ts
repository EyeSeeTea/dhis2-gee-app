import { ImportRuleData } from "../../../domain/entities/ImportRule";
import { Moment } from "moment";

export interface ImportRuleListState {
    importRules: ImportRuleState[];
    selection: { id: string }[];
    toDelete: string[];
    search: string;
    lastExecutedFilter: Moment | null;
    showImportDialog: boolean;
    isImporting: boolean;
    isDeleting: boolean;
    importRuleToExecute: string | undefined;
    objectsTableKey: number;
}

export type ImportRuleState = ImportRuleData;

export const importRuleListInitialState = {
    importRules: [],
    selection: [],
    toDelete: [],
    search: "",
    lastExecutedFilter: null,
    showImportDialog: false,
    isImporting: false,
    isDeleting: false,
    importRuleToExecute: undefined,
    objectsTableKey: new Date().getTime(),
};
