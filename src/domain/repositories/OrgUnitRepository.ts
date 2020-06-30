import { Id } from "../entities/Ref";
import { OrgUnit } from "../entities/OrgUnit";

export default interface OrgUnitRepository {
    getByIds(ids: Id[]): Promise<OrgUnit[]>;
    getAllWithCoordinates(): Promise<OrgUnit[]>;
}
