import { Id } from "./Ref";

export interface OrgUnit {
    id: Id;
    geometry?: Geometry;
}

export type Geometry =
    | { type: "Point"; coordinates: Coordinates }
    | { type: "Polygon"; coordinates: Coordinates[][][] };

export type Coordinates = [number, number];
