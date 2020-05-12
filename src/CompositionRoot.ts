import { D2Api, D2ApiDefault } from "d2-api"
import DataElementD2ApiRepository from "./data/repositories/DataElementD2ApiRepository";
import { GetDataElementsUseCase } from "./domain/usecases/GetDataElementsUseCase";
import ImportUseCase from "./domain/usecases/ImportUseCase";
import { Config } from "./webapp/models/Config";

class CompositionRoot {
    private d2Api: D2Api;
    private getDataElementsUseCase: GetDataElementsUseCase
    private importUseCase: ImportUseCase

    constructor(baseUrl: string, private config: Config) {
        this.d2Api = new D2ApiDefault({ baseUrl });

        this.getDataElementsUseCase = this.createGetDataElementsUseCase();
        this.importUseCase = this.createImportUseCase();
    }

    public get dataElements() {
        return { get: this.getDataElementsUseCase.execute.bind(this.getDataElementsUseCase) };
    }

    public get geeImport() {
        return { import: this.importUseCase.execute.bind(this.importUseCase) };
    }

    private createGetDataElementsUseCase(): GetDataElementsUseCase {
        const dataElementsRepository = new DataElementD2ApiRepository(this.d2Api);
        return new GetDataElementsUseCase(dataElementsRepository);
    }

    private createImportUseCase(): ImportUseCase {
        return new ImportUseCase(this.d2Api, this.config);
    }
}

export default CompositionRoot