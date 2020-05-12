import DataElementRepository from "../domain/repositories/DataElementRepository"
import { Id } from "../domain/entities/ReferenceObject";
import { D2Api } from "d2-api";
import DataElement from "../domain/entities/DataElement";

class DataElementD2ApiRepository implements DataElementRepository {
    constructor(private d2Api: D2Api) { }

    async getByDataSet(dataSetId: Id): Promise<DataElement[]> {
        const { objects } = await this.d2Api.models.dataElements
            .get({
                paging: false,
                fields: {
                    id: true,
                    name: true,
                    code: true,
                },
                filter: {
                    "dataSetElements.dataSet.id": { eq: dataSetId },
                },
            })
            .getData();

        return objects.map(o => o as DataElement);
    }
}

export default DataElementD2ApiRepository;