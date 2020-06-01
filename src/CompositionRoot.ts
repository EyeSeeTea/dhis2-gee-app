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
//const OrgUnitRepository = new LiteralToken('OrgUnitRepository');

interface Type<T> {
    new(...args: any[]): T;
}

export type NamedToken = "importUseCase" | "downloadUseCase";

type PrivateNamedToken = "importRuleRepository";

type Token<T> = Type<T> | NamedToken | PrivateNamedToken;

class CompositionRoot {
    private d2Api: D2Api;

    private dependencies = new Map<Token<any>, any>();

    constructor(baseUrl: string, private config: Config) {
        this.d2Api = new D2ApiDefault({ baseUrl });

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

    private initializeDataElements() {
        const dataElementsRepository = new DataElementD2ApiRepository(this.d2Api);
        const getDataElementsUseCase = new GetDataElementsUseCase(dataElementsRepository);
        this.dependencies.set(GetDataElementsUseCase, getDataElementsUseCase);
    }

    private initializeImportRules() {
        const dataStore = this.d2Api.dataStore(this.config.data.base.dataStore.namespace);
        const importRulesKey = this.config.data.base.dataStore.keys.importRules;
        const importRulesDefaultSuffixKey = this.config.data.base.dataStore.keys.imports.suffix;
        const importRuleRepository = new ImportRuleD2ApiRepository(
            dataStore,
            importRulesKey,
            importRulesDefaultSuffixKey
        );
        this.dependencies.set("importRuleRepository", importRuleRepository);

        const getImportRulesUseCase = new GetImportRulesUseCase(importRuleRepository);
        this.dependencies.set(GetImportRulesUseCase, getImportRulesUseCase);
    }

    private initializeImportAndDownload() {
        const importRuleRepository = this.dependencies.get(
            "importRuleRepository"
        ) as ImportRuleRepository;
        const geeDataSetRepository = new GeeDataSetConfigRepository(this.config);
        const geeDataRepository = new GeeDataEarthEngineRepository(this.d2Api);
        const orgUnitsRepository = new OrgUnitD2ApiRepository(this.d2Api);
        const dataValueSetD2ApiRepository = new DataValueSetD2ApiRepository(this.d2Api);
        const dataValueSetFileRepository = new DataValueSetFileRepository();

        const importUseCase = new ImportUseCase(
            importRuleRepository,
            geeDataSetRepository,
            geeDataRepository,
            orgUnitsRepository,
            dataValueSetD2ApiRepository
        );

        const downloadUseCase = new ImportUseCase(
            importRuleRepository,
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
