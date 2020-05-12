import { Id } from "./ReferenceObject";

export interface OrgUnit {
    id: Id;
    featureType?: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    coordinates?: string;
}