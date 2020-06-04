import { Id } from "../entities/Ref";
import { Mapping } from "../entities/Mapping";

export default interface MappingRepository {
    getAll(ids?: Id[]): Promise<Mapping[]>;
}
