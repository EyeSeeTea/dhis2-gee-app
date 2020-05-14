import { D2Api, D2ApiDefault } from "d2-api"
import DataElementD2ApiRepository from "./data/dhis2/DataElementD2ApiRepository";
import { GetDataElementsUseCase } from "./domain/dhis2/usecases/GetDataElementsUseCase";
import ImportUseCase from "./domain/import/ImportUseCase";
import { Config } from "./webapp/models/Config";
import { GeeDataEarthEngineRepository } from "./data/gee/GeeDataValueSetApiRepository";
import OrgUnitD2ApiRepository from "./data/dhis2/OrgUnitD2ApiRepository";
import DataValueSetD2ApiRepository from "./data/dhis2/DataValueSetD2ApiRepository";
import { GeeDataSetConfigRepository } from "./data/gee/GeeDataSetConfigRepository";
import DataValueSetFileRepository from "./data/dhis2/DataValueSetFileRepository";
//const OrgUnitRepository = new LiteralToken('OrgUnitRepository');

interface Type<T> {
    new(...args: any[]): T;
}

// Interfaces don't have type information at runtime, so we need
// a way to have a key to interfaces in runtime
class LiteralToken {
    constructor(public injectionIdentifier: string) { }
}

type Token<T> = Type<T> | LiteralToken;

const importUseCaseToken = new LiteralToken('importUseCaseToken');
const downloadUseCaseToken = new LiteralToken('downloadUseCaseToken');

class CompositionRoot {
    private d2Api: D2Api;

    private dependencies = new Map<Token<any>, any>();

    constructor(baseUrl: string, private config: Config) {
        this.d2Api = new D2ApiDefault({ baseUrl });

        this.initializeDataElements();
        this.initializeImportAndDownload();
    }

    public get dataElements() {
        const getDataElementsUseCase = this.dependencies.get(GetDataElementsUseCase);
        return { get: getDataElementsUseCase.execute.bind(getDataElementsUseCase) };
    }

    public get geeImport() {
        const importUseCase = this.dependencies.get(importUseCaseToken);
        const downloadUseCase = this.dependencies.get(downloadUseCaseToken);

        return {
            import: importUseCase.execute.bind(importUseCase),
            download: downloadUseCase.execute.bind(downloadUseCase)
        };
    }

    private initializeDataElements() {
        const dataElementsRepository = new DataElementD2ApiRepository(this.d2Api);
        const getDataElementsUseCase = new GetDataElementsUseCase(dataElementsRepository);
        this.dependencies.set(GetDataElementsUseCase, getDataElementsUseCase);
    }

    private initializeImportAndDownload() {
        const geeDataSetRepository = new GeeDataSetConfigRepository(this.config);
        const geeDataRepository = new GeeDataEarthEngineRepository(this.d2Api);
        const orgUnitsRepository = new OrgUnitD2ApiRepository(this.d2Api);
        const dataValueSetD2ApiRepository = new DataValueSetD2ApiRepository(this.d2Api);

        const dataValueSetFileRepository = new DataValueSetFileRepository();

        const importUseCase =
            new ImportUseCase(geeDataSetRepository, geeDataRepository, orgUnitsRepository, dataValueSetD2ApiRepository);

        const downloadUseCase =
            new ImportUseCase(geeDataSetRepository, geeDataRepository, orgUnitsRepository, dataValueSetFileRepository);

        this.dependencies.set(importUseCaseToken, importUseCase);
        this.dependencies.set(downloadUseCaseToken, downloadUseCase);
    }
}

export default CompositionRoot
