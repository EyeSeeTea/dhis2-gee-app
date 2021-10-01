import { D2Api, MetadataPick } from "../../types/d2-api";

const baseConfig = {
    dataStore: {
        namespace: "dhis2-gee-app",
        keys: {
            mappings: "mappings",
            importRules: "import-rules",
            importsHistory: "imports-history",
            imports: {
                suffix: "@import",
            },
            globalOUMapping: "globalOUMapping",
            geeDataSets: "geeDataSets",
        },
    },
};

export type BaseConfig = typeof baseConfig;

export interface ConfigData {
    base: BaseConfig;
}

export interface CategoryCombo {
    id: string;
    code: string;
}

const metadataParams = {} as const;

export type Metadata = MetadataPick<typeof metadataParams>;

export class Config {
    public data: ConfigData;

    constructor(data: ConfigData) {
        this.data = data;
    }

    public get<Key extends keyof ConfigData>(key: Key): ConfigData[Key] {
        return this.data[key];
    }

    static async build(_api: D2Api): Promise<Config> {
        return new Config({ base: baseConfig });
    }
}
