import { D2Api, D2ApiDefault } from "d2-api";
import DataElementD2ApiRepository from "./data/DataElementD2ApiRepository";
import { GetDataElementsUseCase } from "./domain/usecases/GetDataElementsUseCase";
import ImportUseCase from "./domain/usecases/ImportUseCase";
import { Config } from "./webapp/models/Config";
import { GeeDataEarthEngineRepository } from "./data/GeeDataValueSetApiRepository";
import OrgUnitD2ApiRepository from "./data/OrgUnitD2ApiRepository";
import DataValueSetD2ApiRepository from "./data/DataValueSetD2ApiRepository";
import { GeeDataSetConfigRepository } from "./data/GeeDataSetConfigRepository";
import DataValueSetFileRepository from "./data/DataValueSetFileRepository";
import ImportRuleD2ApiRepository from "./data/ImportRuleD2ApiRepository";
import { GetImportRulesUseCase } from "./domain/usecases/GetImportRulesUseCase";
import { ImportRuleRepository } from "./domain/repositories/ImportRuleRepository";
import { DeleteImportRulesUseCase } from "./domain/usecases/DeleteImportRulesUseCase";
import { GetImportRuleByIdUseCase } from "./domain/usecases/GetImportRuleByIdUseCase";
import { UpdateImportRuleUseCase } from "./domain/usecases/UpdateImportRuleUseCase";
import MappingD2ApiRepository from "./data/MappingD2ApiRepository";
import { CreateImportRuleUseCase } from "./domain/usecases/CreateImportRuleUseCase";

interface Type<T> {
    new (...args: any[]): T;
}

export type NamedToken = "importUseCase" | "downloadUseCase";

type PrivateNamedToken = "dataStore" | "importRuleRepository";

type Token<T> = Type<T> | NamedToken | PrivateNamedToken;

class CompositionRoot {
    private d2Api: D2Api;

    private dependencies = new Map<Token<any>, any>();

    constructor(baseUrl: string, private config: Config) {
        this.d2Api = new D2ApiDefault({ baseUrl });

        this.initializeDataStore();
        this.initializeDataElements();
        this.initializeImportRules();
        this.initializeImportAndDownload();
    }

    public get<T>(token: Type<T> | NamedToken): T {
        return this.dependencies.get(token);
    }

    public bind<T>(token: Type<T> | NamedToken, value: T) {
        this.dependencies.set(token, value);
    }

    private initializeDataStore() {
        const dataStore = this.d2Api.dataStore(this.config.data.base.dataStore.namespace);
        this.dependencies.set("dataStore", dataStore);
    }

    private initializeDataElements() {
        const dataElementsRepository = new DataElementD2ApiRepository(this.d2Api);
        const getDataElementsUseCase = new GetDataElementsUseCase(dataElementsRepository);
        this.dependencies.set(GetDataElementsUseCase, getDataElementsUseCase);
    }

    private initializeImportRules() {
        const importRuleRepository = new ImportRuleD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.importRules,
            this.config.data.base.dataStore.keys.imports.suffix
        );
        this.dependencies.set("importRuleRepository", importRuleRepository);

        const getImportRuleById = new GetImportRuleByIdUseCase(importRuleRepository);
        const getImportRulesUseCase = new GetImportRulesUseCase(importRuleRepository);
        const createImportRuleUseCase = new CreateImportRuleUseCase(importRuleRepository);
        const updateImportRuleUseCase = new UpdateImportRuleUseCase(importRuleRepository);
        const deleteImportRulesUseCase = new DeleteImportRulesUseCase(importRuleRepository);

        this.dependencies.set(GetImportRuleByIdUseCase, getImportRuleById);
        this.dependencies.set(GetImportRulesUseCase, getImportRulesUseCase);
        this.dependencies.set(CreateImportRuleUseCase, createImportRuleUseCase);
        this.dependencies.set(UpdateImportRuleUseCase, updateImportRuleUseCase);
        this.dependencies.set(DeleteImportRulesUseCase, deleteImportRulesUseCase);
    }

    private initializeImportAndDownload() {
        const importRuleRepository = this.dependencies.get(
            "importRuleRepository"
        ) as ImportRuleRepository;

        const mappingRepository = new MappingD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.mappings
        );

        const geeDataSetRepository = new GeeDataSetConfigRepository(this.config);
        const geeDataRepository = new GeeDataEarthEngineRepository(this.d2Api);
        const orgUnitsRepository = new OrgUnitD2ApiRepository(this.d2Api);
        const dataValueSetD2ApiRepository = new DataValueSetD2ApiRepository(this.d2Api);
        const dataValueSetFileRepository = new DataValueSetFileRepository();

        const importUseCase = new ImportUseCase(
            importRuleRepository,
            mappingRepository,
            geeDataSetRepository,
            geeDataRepository,
            orgUnitsRepository,
            dataValueSetD2ApiRepository
        );

        const downloadUseCase = new ImportUseCase(
            importRuleRepository,
            mappingRepository,
            geeDataSetRepository,
            geeDataRepository,
            orgUnitsRepository,
            dataValueSetFileRepository
        );

        this.dependencies.set("importUseCase", importUseCase);
        this.dependencies.set("downloadUseCase", downloadUseCase);
    }
}

export default CompositionRoot;
