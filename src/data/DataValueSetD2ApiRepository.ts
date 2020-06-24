import { D2Api } from "d2-api";
import DataValueSetRepository, {
    SaveDataValueSetReponse,
} from "../domain/repositories/DataValueSetRepository";
import { DataValueSet } from "../domain/entities/DataValueSet";

class DataValueSetD2ApiRepository implements DataValueSetRepository {
    constructor(private d2Api: D2Api) {}

    async save(dataValueSet: DataValueSet): Promise<SaveDataValueSetReponse> {
        const res = await this.d2Api.dataValues.postSet({}, dataValueSet).getData();

        return res;
    }
}

export default DataValueSetD2ApiRepository;
