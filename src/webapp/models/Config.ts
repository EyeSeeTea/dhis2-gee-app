import { D2Api, MetadataPick } from "d2-api";

const baseConfig = {
    // Add here static configuration
    gee: {
        serviceAccount: "test-63@foo-dhis2-gee-app.iam.gserviceaccount.com",
        privateKeyFile: "foo-dhis2-gee-app-09be93975aeb.json",
    },
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

    static async build(api: D2Api): Promise<Config> {
        console.log(api.baseUrl);

        const data: ConfigData = {
            base: baseConfig,
        };

        return new Config(data);
    }
}
