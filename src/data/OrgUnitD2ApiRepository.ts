import OrgUnitRepository from "../domain/repositories/OrgUnitRepository";
import { D2Api, Id } from "d2-api";
import { OrgUnit } from "../domain/entities/OrgUnit";

class OrgUnitD2ApiRepository implements OrgUnitRepository {
    constructor(private d2Api: D2Api) {}

    async getByIds(ids: Id[]): Promise<OrgUnit[]> {
        const response = await this.d2Api
            .get<{ organisationUnits: OrgUnit[] }>("/organisationUnits", {
                paging: false,
                fields: "id,geometry",
                filter: `id:in:[${ids.join(",")}]`,
            })
            .getData();

        return response.organisationUnits;
    }

    async getAllWithCoordinates(): Promise<OrgUnit[]> {
        const response = await this.d2Api
            .get<{ organisationUnits: OrgUnit[] }>("/organisationUnits", {
                paging: false,
                fields: "id,geometry",
                filter: "geometry:!null",
            })
            .getData();

        return response.organisationUnits;
    }
}

export default OrgUnitD2ApiRepository;
