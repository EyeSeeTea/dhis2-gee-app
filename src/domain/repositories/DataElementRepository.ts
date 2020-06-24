import DataElement from "../entities/DataElement";
import { Id } from "../entities/Ref";

export default interface DataElementRepository {
    getByDataSet(dataSetId: Id): Promise<DataElement[]>;
}
