import { defaultPeriod } from "../../../domain/entities/PeriodOption";
import {
    ImportRuleWritableData,
    ImportRuleProtectedData,
} from "../../../domain/entities/ImportRule";

export interface ImportRuleDetailState {
    importRule: ImportRuleState;
    showOUDialog: boolean;
    showPeriodDialog: boolean;
    showImportDialog: boolean;
    isImporting: boolean;
    isOndemand: boolean | undefined;
}

export type ImportRuleState = ImportRuleWritableData & Pick<ImportRuleProtectedData, "id">;

export const importRuleDetailInitialState = {
    importRule: {
        id: "",
        name: "",
        code: "",
        description: "",
        selectedOUs: [],
        periodInformation: defaultPeriod,
        selectedMappings: [],
    },
    showOUDialog: false,
    showPeriodDialog: false,
    showImportDialog: false,
    isImporting: false,
    isOndemand: undefined,
};
