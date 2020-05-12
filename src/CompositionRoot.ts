import { D2Api, D2ApiDefault } from "d2-api"
import DataElementD2ApiRepository from "./data/DataElementD2ApiRepository";
import { GetDataElementsUseCase } from "./domain/usecases/GetDataElementsUseCase";

class CompositionRoot {
    private d2Api: D2Api;
    private getDataElementsUseCase: GetDataElementsUseCase

    constructor(baseUrl: string) {
        this.d2Api = new D2ApiDefault({ baseUrl });

        this.getDataElementsUseCase = this.createGetDataElementsUseCase();
    }

    public get dataElements() {
        return { get: this.getDataElementsUseCase.execute.bind(this.getDataElementsUseCase) };
    }

    private createGetDataElementsUseCase() {
        const dataElementsRepository = new DataElementD2ApiRepository(this.d2Api);
        return new GetDataElementsUseCase(dataElementsRepository);
    }
}

export default CompositionRoot