import OrgUnitRepository from "../domain/repositories/OrgUnitRepository";
import { D2Api, Id } from "d2-api";
import { OrgUnit } from "../domain/entities/OrgUnit";

class OrgUnitD2ApiRepository implements OrgUnitRepository {
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

        return objects.map(o => o as OrgUnit);
    }

    async getAllWithCoordinates(): Promise<OrgUnit[]> {
        //TODO: use this.d2Api.models.organisationUnits when !null operator filter
        //may be provided
        const response = await this.d2Api
            .get<{ organisationUnits: OrgUnit[] }>("/organisationUnits", {
                paging: false,
                fields: "id,featureType,coordinates",
                filter: "coordinates:!null",
            })
            .getData();

        return response.organisationUnits;
    }
}

export default OrgUnitD2ApiRepository;
