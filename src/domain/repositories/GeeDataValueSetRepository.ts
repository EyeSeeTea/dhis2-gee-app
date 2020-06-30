import { Moment } from "moment";
import { GeeDataValueSet } from "../entities/GeeDataValueSet";

export type GeeGeometry =
    | { type: "point"; coordinates: GeeCoordinates }
    | { type: "multi-polygon"; polygonCoordinates: GeeCoordinates[][][] };

export type GeeDataSetId = string;
export type GeeCoordinates = [number, number];
export type GeeInterval = { start: Moment; end: Moment };

export interface GeeDataFilters<Band> {
    id: GeeDataSetId;
    bands: Band[];
    geometry: GeeGeometry;
    interval: GeeInterval;
    scale?: number;
}

export interface GeeDataValueSetRepository {
    getData<Band extends string>(options: GeeDataFilters<Band>): Promise<GeeDataValueSet<Band>>;
}
