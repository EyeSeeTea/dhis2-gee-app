import { D2Api } from "../../types/d2-api";

export class ExampleModel {
    constructor(private api: D2Api) {}

    async getDataSets() {
        const { api } = this;
        const { objects } = await api.models.dataSets
            .get({
                fields: { id: true, categoryCombo: { name: true } },
                pageSize: 5,
            })
            .getData();
        return objects;
    }
}
