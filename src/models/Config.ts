import { D2Api, MetadataPick } from "d2-api";

const baseConfig = {
    // Add here static configuration
    dataStore: {
        namespace: "dhis2-gee-app",
        keys: {
            mappings: "mappings",
            imports: {
                suffix: "@import",
            },
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
        const data: ConfigData = {
            base: baseConfig,
        };

        return new Config(data);
    }
}
