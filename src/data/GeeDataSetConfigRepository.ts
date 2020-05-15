import { Config } from "../webapp/models/Config";
import { GeeDataSetRepository } from "../domain/repositories/GeeDataSetRepository";
import { GeeDataSet } from "../domain/entities/GeeDataSet";
import _ from "lodash";

export class GeeDataSetConfigRepository implements GeeDataSetRepository {
    constructor(private config: Config) { }

    async getByCode(code: string): Promise<GeeDataSet> {
        const data = _(this.config.data.base.googleDatasets).get(code);

        return {
            code,
            displayName: data["displayName"],
            imageCollectionId: data["pointer"],
            bands: data["bands"],
            doc: data["doc"],
        }
    }
}


