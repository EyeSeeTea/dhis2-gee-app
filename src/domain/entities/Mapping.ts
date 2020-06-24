import { Id } from "./Ref";
import { TransformExpression } from "./TransformExpression";

export interface Mapping {
    id: Id;
    name: string;
    description: string;
    dataSetId: string;
    dataSetName: string;
    geeImage: string;
    created: Date;
    attributeMappingDictionary: AttributeMappingDictionary;
    isDefault: boolean;
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
    transformExpression?: TransformExpression;
}
