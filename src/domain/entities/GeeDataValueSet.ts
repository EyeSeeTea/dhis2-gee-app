//TODO: rewiew this coupling of moment in domain
import { Moment } from "moment";

export type GeeDataValueSet<Band> = GeeDataValue<Band>[];

export type GeeDataValue<Band> = {
    band: Band;
    value: number;
    lat: number;
    lon: number;
    periodId: string;
    date: Moment;
};
