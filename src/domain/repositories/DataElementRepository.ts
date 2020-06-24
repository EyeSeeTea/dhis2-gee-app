import DataElement from "../entities/DataElement";
import { Id } from "../entities/ReferenceObject";

export default interface DataElementRepository {
    getByDataSet(dataSetId: Id): Promise<DataElement[]>
} 