import { D2Api, MetadataPick } from "d2-api";

const baseConfig = {
    // Add here static configuration
};

export type BaseConfig = typeof baseConfig;

interface ConfigData {
    base: BaseConfig;
    categoryCombos: CategoryCombo[];
}

interface CategoryCombo {
    id: string;
    code: string;
}

const metadataParams = {
    categoryCombos: {
        fields: { id: true, code: true },
    },
} as const;

export type Metadata = MetadataPick<typeof metadataParams>;

export class Config {
    constructor(private api: D2Api, public data: ConfigData) {}

    public get<Key extends keyof ConfigData>(key: Key): ConfigData[Key] {
        return this.data[key];
    }

    static async build(api: D2Api): Promise<Config> {
        const metadata = await api.metadata.get(metadataParams).getData();

        const data: ConfigData = {
            base: baseConfig,
            categoryCombos: metadata.categoryCombos,
        };

        return new Config(api, data);
    }
}
