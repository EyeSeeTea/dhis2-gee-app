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
            imports: {
                suffix: "@import",
            },
        },
    },
    googleDatasets: {
        chirpsDaily: {
            displayName: "CHIRPS - DAILY",
            pointer: "UCSB-CHG/CHIRPS/DAILY",
            bands: ["precipitation"],
            doc:
                "https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY",
        },
        era5Daily: {
            displayName: "ERA5 - DAILY",
            pointer: "ECMWF/ERA5/DAILY",
            bands: [
                "mean_2m_air_temperature",
                "minimum_2m_air_temperature",
                "maximum_2m_air_temperature",
                "dewpoint_2m_temperature",
                "total_precipitation",
                "surface_pressure",
                "mean_sea_level_pressure",
                "u_component_of_wind_10m",
                "v_component_of_wind_10m",
            ],
            doc:
                "https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY",
        },
        daymetV3: {
            displayName: "DAYMET V3",
            pointer: "NASA/ORNL/DAYMET_V3",
            bands: ["dayl", "prcp", "srad", "swe", "tmax", "tmin", "vp"],
            doc: "https://developers.google.com/earth-engine/datasets/catalog/NASA_ORNL_DAYMET_V3",
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
        console.log(api);

        const data: ConfigData = {
            base: baseConfig,
        };

        return new Config(data);
    }
}
