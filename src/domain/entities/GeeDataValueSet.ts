//TODO: rewiew this coupling of moment in domain
import { Moment } from "moment";
import { GeeGeometry } from "../repositories/GeeDataValueSetRepository";

export type GeeDataValueSet<Band> = GeeDataValue<Band>[];

export type GeeDataValue<Band> = {
    band: Band;
    value: number;
    geometry: GeeGeometry;
    periodId: string;
    date: Moment;
};
