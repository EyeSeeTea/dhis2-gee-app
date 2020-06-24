import { Id } from "./Ref";

export interface DataValueSet {
    dataValues: DataValue[];
}

export interface DataValue {
    dataElement: Id;
    value: string;
    orgUnit: Id;
    period: string;
    attributeOptionCombo?: Id;
    categoryOptionCombo?: Id;
}
