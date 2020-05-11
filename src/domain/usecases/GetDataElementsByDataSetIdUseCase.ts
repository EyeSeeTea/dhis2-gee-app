import DataElement from "../entities/DataElement";
import DataElementRepository from "../repositories/DataElementRepository";
import { Id } from "../entities/ReferenceObject";

class GetDataElementsByDataSetIdUseCase {
    constructor(private dataElementRepository: DataElementRepository) { }

    execute(dataSetId: Id): Promise<DataElement[]> {
        return this.dataElementRepository.getByDataSet(dataSetId);
    }
}

export default GetDataElementsByDataSetIdUseCase;