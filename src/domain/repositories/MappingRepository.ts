import { Id } from "../entities/Ref";
import { Mapping } from "../entities/Mapping";
import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";

export type DeleteMappingByIdsError = UnexpectedError;

export default interface MappingRepository {
    getAll(ids?: Id[]): Promise<Mapping[]>;
    deleteByIds(id: Id[]): Promise<Either<DeleteMappingByIdsError, true>>;
}
