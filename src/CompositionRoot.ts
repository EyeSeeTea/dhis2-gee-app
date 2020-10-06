import { D2Api } from "d2-api";
import DataElementD2ApiRepository from "./data/DataElementD2ApiRepository";
import { GetDataElementsUseCase } from "./domain/usecases/GetDataElementsUseCase";
import ImportUseCase from "./domain/usecases/ImportUseCase";
import { Config } from "./webapp/models/Config";
import { GeeDataEarthEngineRepository } from "./data/GeeDataValueSetApiRepository";
import OrgUnitOldD2ApiRepository from "./data/OrgUnitOldD2ApiRepository";
import DataValueSetD2ApiRepository from "./data/DataValueSetD2ApiRepository";
import { GeeDataSetFileRepository } from "./data/GeeDataSetD2ApiRepository";
import DataValueSetFileRepository from "./data/DataValueSetFileRepository";
import ImportRuleD2ApiRepository from "./data/ImportRuleD2ApiRepository";
import { GetImportRulesUseCase } from "./domain/usecases/GetImportRulesUseCase";
import { ImportRuleRepository } from "./domain/repositories/ImportRuleRepository";
import { DeleteImportRulesUseCase } from "./domain/usecases/DeleteImportRulesUseCase";
import { GetImportRuleByIdUseCase } from "./domain/usecases/GetImportRuleByIdUseCase";
import { UpdateImportRuleUseCase } from "./domain/usecases/UpdateImportRuleUseCase";
import MappingD2ApiRepository from "./data/MappingD2ApiRepository";
import { CreateImportRuleUseCase } from "./domain/usecases/CreateImportRuleUseCase";
import { DeleteMappingsUseCase } from "./domain/usecases/DeleteMappingsUseCase";
import ImportSummaryD2ApiRepository from "./data/ImportSummaryD2ApiRepository";
import { GetImportSummariesUseCase } from "./domain/usecases/GetImportSummariesUseCase";
import { DeleteImportSummariesUseCase } from "./domain/usecases/DeleteImportSummariesUseCase";
import { GetOrgUnitsWithCoordinatesUseCase } from "./domain/usecases/GetOrgUnitsWithCoordinatesUseCase";
import { CreateGlobalOUMappingUseCase } from "./domain/usecases/CreateGlobalOUMappingUseCase";
import { GetGlobalOUMappingByMappingIdUseCase } from "./domain/usecases/GetGlobalOUMappingByMappingIdUseCase";
import GlobalOUMappingD2ApiRepository from "./data/GlobalOUMappingD2ApiRepository";
import { DeleteGlobalOUMappingUseCase } from "./domain/usecases/DeleteGlobalOUMappingUseCase";
import { GlobalOUMappingRepository } from "./domain/repositories/GlobalOUMappingRepository";
import { GeeDataSetRepository } from "./domain/repositories/GeeDataSetRepository";
import { GetGeeDataSetsUseCase } from "./domain/usecases/GetGeeDataSetsUseCase";
import { GetGlobalOUMappingsUseCase } from "./domain/usecases/GetGlobalOUMappingsUseCase";
import { GetDefaultMappingUseCase } from "./domain/usecases/GetDefaultMappingUseCase";
import { SetAsDefaultMappingUseCase } from "./domain/usecases/SetAsDefaultMappingUseCase";
import { GetGeeDataSetByIdUseCase } from "./domain/usecases/GetGeeDataSetByIdUseCase";
import OrgUnitD2ApiRepository from "./data/OrgUnitD2ApiRepository";
import OrgUnitRepository from "./domain/repositories/OrgUnitRepository";
import { EarthEngine } from "./types/google-earth-engine";

interface Type<T> {
    new (...args: any[]): T;
}

export type NamedToken = "importUseCase" | "downloadUseCase";

type PrivateNamedToken =
    | "dataStore"
    | "importRuleRepository"
    | "importSummaryRepository"
    | "globalOUMappingRepository"
    | "geeDataSetRepository"
    | "orgUnitRepository";

type Token<T> = Type<T> | NamedToken | PrivateNamedToken;

class CompositionRoot {
    private dependencies = new Map<Token<any>, any>();
    private apiVersion: number;

    constructor(
        private d2Api: D2Api,
        private ee: EarthEngine,
        d2Version: string,
        private config: Config
    ) {
        this.apiVersion = +d2Version.split(".")[1];

        this.initializeDataStore();
        this.initializeGeeDataSet();
        this.initializeGlobalOUMappings();
        this.initializeOrgUnits();
        this.initializeDataElements();
        this.initializeImportsHistory();
        this.initializeImportRules();
        this.initializeImportAndDownload();
        this.initializeMapping();
    }

    public get<T>(token: Type<T> | NamedToken): T {
        return this.dependencies.get(token);
    }

    public bind<T>(token: Type<T> | NamedToken, value: T) {
        this.dependencies.set(token, value);
    }

    public geeDataSets() {
        return {
            getById: this.get(GetGeeDataSetByIdUseCase),
            getAll: this.get(GetGeeDataSetsUseCase),
        };
    }

    public importRules() {
        return {
            getById: this.get(GetImportRuleByIdUseCase),
            getAll: this.get(GetImportRulesUseCase),
            create: this.get(CreateImportRuleUseCase),
            update: this.get(UpdateImportRuleUseCase),
            delete: this.get(DeleteImportRulesUseCase),
        };
    }

    public importSummaries() {
        return {
            getAll: this.get(GetImportSummariesUseCase),
            delete: this.get(DeleteImportSummariesUseCase),
        };
    }

    public geeImport() {
        return {
            import: this.get<ImportUseCase>("importUseCase"),
            download: this.get<ImportUseCase>("downloadUseCase"),
        };
    }

    public dataElements() {
        return {
            getByDataSet: this.get(GetDataElementsUseCase),
        };
    }

    public orgUnits() {
        return {
            getWithCoordinates: this.get(GetOrgUnitsWithCoordinatesUseCase),
        };
    }

    public globalOUMapping() {
        return {
            get: this.get(GetGlobalOUMappingsUseCase),
            getByMappingId: this.get(GetGlobalOUMappingByMappingIdUseCase),
            create: this.get(CreateGlobalOUMappingUseCase),
            delete: this.get(DeleteGlobalOUMappingUseCase),
        };
    }

    public mapping() {
        return {
            getDefault: this.get(GetDefaultMappingUseCase),
            setAsDefault: this.get(SetAsDefaultMappingUseCase),
            delete: this.get(DeleteMappingsUseCase),
        };
    }

    private initializeGeeDataSet() {
        const geeDataSetRepository = new GeeDataSetFileRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.geeDataSets
        );
        this.dependencies.set("geeDataSetRepository", geeDataSetRepository);

        const getGeeDataSetsUseCase = new GetGeeDataSetsUseCase(geeDataSetRepository);
        const getGeeDataSetByIdUseCase = new GetGeeDataSetByIdUseCase(geeDataSetRepository);

        this.dependencies.set(GetGeeDataSetsUseCase, getGeeDataSetsUseCase);
        this.dependencies.set(GetGeeDataSetByIdUseCase, getGeeDataSetByIdUseCase);
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

    private initializeOrgUnits() {
        const orgUnitRepository =
            this.apiVersion < 32
                ? new OrgUnitOldD2ApiRepository(this.d2Api)
                : new OrgUnitD2ApiRepository(this.d2Api);

        this.dependencies.set("orgUnitRepository", orgUnitRepository);
        const getOrgUnitsWithCoordinatesUseCase = new GetOrgUnitsWithCoordinatesUseCase(
            orgUnitRepository
        );
        this.dependencies.set(GetOrgUnitsWithCoordinatesUseCase, getOrgUnitsWithCoordinatesUseCase);
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

        const importSummaryRepository = this.dependencies.get("importSummaryRepository");

        const deleteImportRulesUseCase = new DeleteImportRulesUseCase(
            importRuleRepository,
            importSummaryRepository
        );

        this.dependencies.set(GetImportRuleByIdUseCase, getImportRuleById);
        this.dependencies.set(GetImportRulesUseCase, getImportRulesUseCase);
        this.dependencies.set(CreateImportRuleUseCase, createImportRuleUseCase);
        this.dependencies.set(UpdateImportRuleUseCase, updateImportRuleUseCase);
        this.dependencies.set(DeleteImportRulesUseCase, deleteImportRulesUseCase);
    }

    initializeGlobalOUMappings() {
        const globalOUMappingRepository = new GlobalOUMappingD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.globalOUMapping
        );

        this.dependencies.set("globalOUMappingRepository", globalOUMappingRepository);

        const getGlobalOUMappingsUseCase = new GetGlobalOUMappingsUseCase(
            globalOUMappingRepository
        );

        const createGlobalOrgUnitMappingUseCase = new CreateGlobalOUMappingUseCase(
            globalOUMappingRepository
        );
        const getGlobalOUMappingByMappingIdUseCase = new GetGlobalOUMappingByMappingIdUseCase(
            globalOUMappingRepository
        );
        const deleteGlobalOUMappingUseCase = new DeleteGlobalOUMappingUseCase(
            globalOUMappingRepository
        );

        this.dependencies.set(GetGlobalOUMappingsUseCase, getGlobalOUMappingsUseCase);
        this.dependencies.set(CreateGlobalOUMappingUseCase, createGlobalOrgUnitMappingUseCase);
        this.dependencies.set(
            GetGlobalOUMappingByMappingIdUseCase,
            getGlobalOUMappingByMappingIdUseCase
        );
        this.dependencies.set(DeleteGlobalOUMappingUseCase, deleteGlobalOUMappingUseCase);
    }

    initializeImportsHistory() {
        const importSummaryRepository = new ImportSummaryD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.importsHistory
        );
        this.dependencies.set("importSummaryRepository", importSummaryRepository);

        const getImportSummariesUseCase = new GetImportSummariesUseCase(importSummaryRepository);
        const deleteImportSummariesUseCase = new DeleteImportSummariesUseCase(
            importSummaryRepository
        );

        this.dependencies.set(GetImportSummariesUseCase, getImportSummariesUseCase);
        this.dependencies.set(DeleteImportSummariesUseCase, deleteImportSummariesUseCase);
    }

    private initializeImportAndDownload() {
        const importRuleRepository = this.dependencies.get(
            "importRuleRepository"
        ) as ImportRuleRepository;

        const mappingRepository = new MappingD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.mappings
        );

        const geeDataSetRepository = this.dependencies.get(
            "geeDataSetRepository"
        ) as GeeDataSetRepository;

        const orgUnitsRepository = this.dependencies.get("orgUnitRepository") as OrgUnitRepository;

        const geeDataRepository = new GeeDataEarthEngineRepository(this.d2Api, this.ee);
        const dataValueSetD2ApiRepository = new DataValueSetD2ApiRepository(this.d2Api);
        const dataValueSetFileRepository = new DataValueSetFileRepository();
        const importSummaryRepository = new ImportSummaryD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.importsHistory
        );

        const importUseCase = new ImportUseCase(
            importRuleRepository,
            mappingRepository,
            geeDataSetRepository,
            geeDataRepository,
            orgUnitsRepository,
            dataValueSetD2ApiRepository,
            importSummaryRepository
        );

        const downloadUseCase = new ImportUseCase(
            importRuleRepository,
            mappingRepository,
            geeDataSetRepository,
            geeDataRepository,
            orgUnitsRepository,
            dataValueSetFileRepository,
            importSummaryRepository
        );

        this.dependencies.set("importUseCase", importUseCase);
        this.dependencies.set("downloadUseCase", downloadUseCase);
    }

    private initializeMapping() {
        const mappingRepository = new MappingD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.mappings
        );

        const importRuleRepository = this.dependencies.get(
            "importRuleRepository"
        ) as ImportRuleRepository;

        const globalOrgUnitMappingRepository = this.dependencies.get(
            "globalOUMappingRepository"
        ) as GlobalOUMappingRepository;

        const getDefaultMappingUseCase = new GetDefaultMappingUseCase(mappingRepository);
        const setAsDefaultMappingUseCase = new SetAsDefaultMappingUseCase(mappingRepository);

        const deleteMappingsUseCase = new DeleteMappingsUseCase(
            mappingRepository,
            importRuleRepository,
            globalOrgUnitMappingRepository
        );

        this.dependencies.set(GetDefaultMappingUseCase, getDefaultMappingUseCase);
        this.dependencies.set(SetAsDefaultMappingUseCase, setAsDefaultMappingUseCase);
        this.dependencies.set(DeleteMappingsUseCase, deleteMappingsUseCase);
    }
}

export default CompositionRoot;
