import OrgUnitRepository from "../repositories/OrgUnitRepository";
import { OrgUnit } from "../entities/OrgUnit";

export class GetOrgUnitsWithCoordinatesUseCase {
    constructor(private orgUnitRepository: OrgUnitRepository) {}

    execute(): Promise<OrgUnit[]> {
        return this.orgUnitRepository.getAllWithCoordinates();
    }
}
