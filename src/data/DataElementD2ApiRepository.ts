import DataElementRepository from "../domain/repositories/DataElementRepository";
import { D2Api, Id } from "d2-api";
import DataElement from "../domain/entities/DataElement";

class DataElementD2ApiRepository implements DataElementRepository {
    constructor(private d2Api: D2Api) {}

    async getByDataSet(dataSetId: Id): Promise<DataElement[]> {
        const { objects } = await this.d2Api.models.dataSets
            .get({
                paging: false,
                fields: {
                    id: true,
                    dataSetElements: {
                        dataElement: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
                filter: {
                    id: { eq: dataSetId },
                },
            })
            .getData();

        if (objects.length === 0) {
            return [];
        } else {
            return objects[0].dataSetElements.map(dse => dse.dataElement);
        }
    }
}

export default DataElementD2ApiRepository;
