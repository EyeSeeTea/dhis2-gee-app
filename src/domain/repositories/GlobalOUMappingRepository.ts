import { Id } from "../entities/Ref";
import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";
import { GlobalOUMapping } from "../entities/GlobalOUMapping";

export type SaveGlobalOUMappingError = UnexpectedError;
export type DeleteGlobalOUMappingError = UnexpectedError;

export interface GlobalOUMappingRepository {
    get(orgUnitId: Id): Promise<GlobalOUMapping>;
    getByMappingId(mappingId: Id): Promise<GlobalOUMapping>;
    DeleteByOrgUnitIds(orgUnitIds: Id[]): Promise<Either<DeleteGlobalOUMappingError, true>>;
    DeleteByMappingId(mappingId: Id): Promise<Either<DeleteGlobalOUMappingError, true>>;
    save(globalOrgUnitMappings: GlobalOUMapping): Promise<Either<SaveGlobalOUMappingError, true>>;
}
