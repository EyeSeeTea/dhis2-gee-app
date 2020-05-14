import { PeriodInformation } from "../../../webapp/models/Import";
import { Id } from "./ReferenceObject";

export interface ImportRule {
    name: string | undefined;
    description: string | undefined;
    id: string | undefined;
    selectedMappings: Mapping[];
    selectedOUs: string[];
    periodInformation: PeriodInformation;
}

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