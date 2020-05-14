import { Id } from "./ReferenceObject";

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

