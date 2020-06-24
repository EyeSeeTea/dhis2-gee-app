import OrgUnitRepository from "../domain/repositories/OrgUnitRepository";
import { D2Api, Id } from "d2-api";
import { OrgUnit } from "../domain/entities/OrgUnit";

class OrgUnitOldD2ApiRepository implements OrgUnitRepository {
    constructor(private d2Api: D2Api) {}

    async getByIds(ids: Id[]): Promise<OrgUnit[]> {
        const { objects } = await this.d2Api.models.organisationUnits
            .get({
                paging: false,
                fields: {
                    id: true,
                    featureType: true,
                    coordinates: true,
                },
                filter: {
                    id: { in: ids },
                },
            })
            .getData();

        const orgUnitsData = objects.map(o => o as OrgUnitData);

        return orgUnitsData.map(this.mapToDomain);
    }

    async getAllWithCoordinates(): Promise<OrgUnit[]> {
        const response = await this.d2Api
            .get<{ organisationUnits: OrgUnitData[] }>("/organisationUnits", {
                paging: false,
                fields: "id,featureType,coordinates",
                filter: "coordinates:!null",
            })
            .getData();

        const domainOrgUnits = response.organisationUnits.map(this.mapToDomain);

        const orgUnitsWithGeometry = domainOrgUnits.filter(ou => ou.geometry).map(this.mapToDomain);

        return orgUnitsWithGeometry;
    }

    private mapToDomain(orgUnitsData: OrgUnitData): OrgUnit {
        try {
            const coordinates = orgUnitsData.coordinates
                ? JSON.parse(orgUnitsData.coordinates)
                : null;

            switch (orgUnitsData.featureType) {
                case "POINT":
                    return {
                        id: orgUnitsData.id,
                        geometry: { type: "Point", coordinates: coordinates },
                    };
                case "POLYGON":
                case "MULTI_POLYGON":
                    return {
                        id: orgUnitsData.id,
                        geometry: { type: "Polygon", coordinates: coordinates },
                    };
                default:
                    return { id: orgUnitsData.id };
            }
        } catch (error) {
            return { id: orgUnitsData.id };
        }
    }
}

export default OrgUnitOldD2ApiRepository;

export interface OrgUnitData {
    id: string;
    featureType?: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    coordinates?: string;
}
