import { GeeDataSetRepository } from "../domain/repositories/GeeDataSetRepository";
import { GeeDataSet } from "../domain/entities/GeeDataSet";
import { geeDataSets } from "./GeeDataSets";

export class GeeDataSetFileRepository implements GeeDataSetRepository {
    async getAll(): Promise<GeeDataSet[]> {
        const dataSetData = geeDataSets;

        const dataSets = Object.keys(dataSetData).map(code =>
            this.mapToDomain(code, dataSetData[code])
        );

        return dataSets;
    }

    async getByCode(code: string): Promise<GeeDataSet> {
        const dataSetData = geeDataSets[code];

        return this.mapToDomain(code, dataSetData);
    }

    private mapToDomain(code: string, dataSetData: any): GeeDataSet {
        return {
            id: code,
            displayName: dataSetData["displayName"],
            description: dataSetData["description"],
            imageCollectionId: dataSetData["pointer"],
            bands: dataSetData["bands"].map((bandData: any) => {
                return {
                    name: bandData["name"],
                    units: bandData["units"],
                    description: bandData["description"],
                };
            }),
            doc: dataSetData["doc"],
        };
    }
}
