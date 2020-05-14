//TODO: rewiew this coupling of moment in domain
import { Moment } from "moment";

export type GeeDataItem<Band> = {
    periodId: string;
    date: Moment;
    lat: number;
    lon: number;
    band: Band;
    value: number;
};

export type GeeData<Band> = GeeDataItem<Band>[];