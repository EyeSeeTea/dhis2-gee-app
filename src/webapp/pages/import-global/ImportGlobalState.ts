import { defaultPeriod, PeriodOption } from "../../../domain/entities/PeriodOption";
import { GlobalOUMapping } from "../../../domain/entities/GlobalOUMapping";
import { Mapping } from "../../../domain/entities/Mapping";

export interface ImportGlobalState {
    showImportDialog: boolean;
    isImporting: boolean;
    selectedOUMappings: { orgUnitPath: string; mappingId: string }[];
    selectedPeriod: PeriodOption;
    globalOUMappings: GlobalOUMapping;
    defaultMapping?: Mapping;
}

export const ImportGlobalStateInitialState = {
    showImportDialog: false,
    isImporting: false,
    selectedOUMappings: [],
    selectedPeriod: defaultPeriod,
    globalOUMappings: {},
    defaultMapping: undefined,
};
