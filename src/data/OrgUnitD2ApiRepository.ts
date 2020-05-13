import OrgUnitRepository from "../domain/repositories/OrgUnitRepository"
import { Id } from "../domain/entities/ReferenceObject";
import { D2Api } from "d2-api";
import { OrgUnit } from "../domain/entities/OrgUnit";

class OrgUnitD2ApiRepository implements OrgUnitRepository {
    constructor(private d2Api: D2Api) { }

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
                    "id": { in: ids },
                },
            })
            .getData();

        return objects.map(o => o as OrgUnit);
    }
}

export default OrgUnitD2ApiRepository;