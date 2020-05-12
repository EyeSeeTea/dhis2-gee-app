import { Id } from "../entities/ReferenceObject";
import { OrgUnit } from "../entities/OrgUnit";

export default interface OrgUnitRepository {
    getByIds(ids: Id[]): Promise<OrgUnit[]>
} 