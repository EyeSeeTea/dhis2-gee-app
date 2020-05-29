import { Id } from "./ReferenceObject";
import { PeriodId } from "./PeriodOption"

export interface ImportRule {
    id: string;
    name: string;
    code?: string;
    created: Date;
    description?: string;
    selectedOUs: string[];
    periodInformation: PeriodInformation;
    selectedMappings: Mapping[];
    lastExecuted?: Date;
    lastUpdated: Date;
}

export type PeriodInformation = {
    id: PeriodId;
    startDate?: Date;
    endDate?: Date;
};

export interface Mapping {
    id: Id;
    name: string;
    description: string;
    dataSetId: string;
    dataSetName: string;
    geeImage: string;
    created: Date;
    attributeMappingDictionary: AttributeMappingDictionary;
}

export interface AttributeMappingDictionary {
    [geeBand: string]: AttributeMapping;
}

export interface AttributeMapping {
    id: string;
    geeBand: string;
    comment: string;
    dataElementId?: string;
    dataElementCode?: string;
    dataElementName?: string;
}