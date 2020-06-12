import { Id } from "../entities/Ref";
import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";
import { GlobalOUMapping } from "../entities/GlobalOUMapping";

export type SaveGlobalOUMappingError = UnexpectedError;
export type DeleteGlobalOUMappingError = UnexpectedError;
export interface GlobalOUMappingRepository {
    get(): Promise<GlobalOUMapping>;
    getByMappingId(mappingId: Id): Promise<GlobalOUMapping>;
    deleteByOrgUnitIds(orgUnitIds: Id[]): Promise<Either<DeleteGlobalOUMappingError, true>>;
    deleteByMappingIds(mappingIds: Id[]): Promise<Either<DeleteGlobalOUMappingError, true>>;
    save(globalOrgUnitMappings: GlobalOUMapping): Promise<Either<SaveGlobalOUMappingError, true>>;
}
