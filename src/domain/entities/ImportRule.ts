import { Id } from "./ReferenceObject";
import { PeriodId } from "./PeriodOption"

export interface ImportRule {
    name: string | undefined;
    description: string | undefined;
    id: string | undefined;
    selectedMappings: Mapping[];
    selectedOUs: string[];
    periodInformation: PeriodInformation;
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