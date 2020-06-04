import { defaultPeriod } from "../../../domain/entities/PeriodOption";
import {
    ImportRuleWritableData,
    ImportRuleProtectedData,
} from "../../../domain/entities/ImportRule";

export interface ImportOnDemandState {
    importRule: ImportRuleState;
    showOUDialog: boolean;
    showPeriodDialog: boolean;
    showImportDialog: boolean;
    isImporting: boolean;
    isDefault: boolean | undefined;
}

export type ImportRuleState = ImportRuleWritableData & Pick<ImportRuleProtectedData, "id">;

export const importOnDemandInitialState = {
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
    isDefault: undefined,
};
