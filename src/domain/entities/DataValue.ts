import { Id } from "./ReferenceObject";

export interface DataValue {
    dataElement: Id;
    value: string;
    orgUnit: Id;
    period: string;
    attributeOptionCombo?: Id;
    categoryOptionCombo?: Id;
}

export interface DataValueSet {
    dataValues: DataValue[];
}