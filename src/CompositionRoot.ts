import { D2Api, D2ApiDefault } from "d2-api"
import DataElementD2ApiRepository from "./data/dhis2/DataElementD2ApiRepository";
import { GetDataElementsUseCase } from "./domain/dhis2/usecases/GetDataElementsUseCase";
import ImportUseCase from "./domain/ImportUseCase";
import { Config } from "./webapp/models/Config";
import { GeeDataEarthEngineRepository } from "./data/gee/GeeDataValueSetApiRepository";
import OrgUnitD2ApiRepository from "./data/dhis2/OrgUnitD2ApiRepository";
import DataValueSetD2ApiRepository from "./data/dhis2/DataValueSetD2ApiRepository";
//const OrgUnitRepository = new LiteralToken('OrgUnitRepository');

class CompositionRoot {
    private d2Api: D2Api;

    private dependencies = new Map<Token<any>, any>();

    constructor(baseUrl: string, private config: Config) {
        this.d2Api = new D2ApiDefault({ baseUrl });

        this.initializeDataElements();
        this.initializeImport();
    }

    public get dataElements() {
        const getDataElementsUseCase = this.dependencies.get(GetDataElementsUseCase);
        return { get: getDataElementsUseCase.execute.bind(getDataElementsUseCase) };
    }

    public get geeImport() {
        const importUseCase = this.dependencies.get(ImportUseCase);
        return { import: importUseCase.execute.bind(importUseCase) };
    }

    private initializeDataElements() {
        const dataElementsRepository = new DataElementD2ApiRepository(this.d2Api);
        const getDataElementsUseCase = new GetDataElementsUseCase(dataElementsRepository);
        this.dependencies.set(GetDataElementsUseCase, getDataElementsUseCase);
    }

    private initializeImport() {
        const geeDataRepository = new GeeDataEarthEngineRepository(this.d2Api);
        const orgUnitsRepository = new OrgUnitD2ApiRepository(this.d2Api);
        const dataValueSetD2ApiRepository = new DataValueSetD2ApiRepository(this.d2Api);

        const importUseCase =
            new ImportUseCase(this.config, geeDataRepository, orgUnitsRepository, dataValueSetD2ApiRepository);

        this.dependencies.set(ImportUseCase, importUseCase);
    }
}

export default CompositionRoot

interface Type<T> {
    new(...args: any[]): T;
}

// Interfaces don't have type information at runtime, so we need
// a way to have a key to interfaces in runtime
class LiteralToken {
    constructor(public injectionIdentifier: string) { }
}

type Token<T> = Type<T> | LiteralToken;
