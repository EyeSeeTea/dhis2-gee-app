import { Id } from "../entities/Ref";
import { Mapping } from "../entities/Mapping";
import { Either } from "../common/Either";
import { ItemIdNotFoundError, UnexpectedError } from "../errors/Generic";

export type DeleteByIdError = ItemIdNotFoundError | UnexpectedError;

export default interface MappingRepository {
    getAll(ids?: Id[]): Promise<Mapping[]>;
    deleteById(id: Id): Promise<Either<DeleteByIdError, true>>;
}
