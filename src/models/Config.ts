import { D2Api, MetadataPick } from "d2-api";

const baseConfig = {
    // Add here static configuration
};

export type BaseConfig = typeof baseConfig;

export interface ConfigData {
    base: BaseConfig;
    categoryCombos: CategoryCombo[];
}

export interface CategoryCombo {
    id: string;
    code: string;
}

// Example, get all categoryCombos[id,code]
const metadataParams = {
    categoryCombos: {
        fields: { id: true, code: true },
    },
} as const;

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
        const metadata = await api.metadata.get(metadataParams).getData();

        const data: ConfigData = {
            base: baseConfig,
            categoryCombos: metadata.categoryCombos,
        };

        return new Config(data);
    }
}
