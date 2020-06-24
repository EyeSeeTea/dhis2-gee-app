import DataElement from "../entities/DataElement";
import DataElementRepository from "../repositories/DataElementRepository";
import { Id } from "../entities/Ref";

export class GetDataElementsUseCase implements GetDataElementsUseCase {
    constructor(private dataElementRepository: DataElementRepository) {}

    execute(dataSetId: Id): Promise<DataElement[]> {
        return this.dataElementRepository.getByDataSet(dataSetId);
    }
}
