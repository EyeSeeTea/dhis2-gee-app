import { D2Api } from "d2-api";
import _ from "lodash";
import DataStore from "d2-api/api/dataStore";
import { getDataStore, getImportCountString } from "../utils/dhis2";
import { Config } from "./Config";
import i18n from "../locales";
import { EarthEngine, Interval } from "./EarthEngine";
import { GeeDhis2, OrgUnit } from "./GeeDhis2";
import Axios from "axios";
import Mapping from "./Mapping";
import { getAttributeMappings, getDataSetValue } from "../utils/gee";
import { buildPeriod } from "../utils/import";

export type PeriodInformation = {
    id: string;
    startDate?: Date;
    endDate?: Date;
};

export interface DataImportData {
    name: string | undefined;
    description: string | undefined;
    id: string | undefined;
    selectedMappings: Mapping[];
    selectedOUs: string[];
    periodInformation: PeriodInformation;
}

const defaultImportData = {
    id: "default",
    name: "Default import",
    description: "Default import. Unique default for all the instance",
    selectedMappings: [],
    selectedOUs: [],
    periodInformation: { id: "" },
};

export type ImportField = keyof DataImportData;

export class DataImport {
    dataStore: DataStore;
    importKey: string;

    static fieldNames: Record<ImportField, string> = {
        id: i18n.t("Id"),
        name: i18n.t("Name"),
        description: i18n.t("Description"),
        selectedMappings: i18n.t("Selected mappings"),
        selectedOUs: i18n.t("Selected organisation units"),
        periodInformation: i18n.t("Selected query period"),
    };

    static getFieldName(field: ImportField): string {
        return this.fieldNames[field];
    }

    constructor(
        private api: D2Api,
        private config: Config,
        public importPrefix: string,
        public data: DataImportData
    ) {
        this.dataStore = getDataStore(this.api, this.config);
        this.importKey = importPrefix + config.data.base.dataStore.keys.imports.suffix;
    }

    static async getImportData(api: D2Api, config: Config, importPrefix: string) {
        const dataStore = getDataStore(api, config);
        const importKey = importPrefix + config.data.base.dataStore.keys.imports.suffix;
        const data = await dataStore.get<DataImportData>(importKey).getData();
        if (!data) {
            console.log(importKey + " import does not exist yet");
            return new DataImport(api, config, importPrefix, defaultImportData);
        }
        return new DataImport(api, config, importPrefix, data);
    }

    public setSelectedMappings(selectedMappings: Mapping[]) {
        const newData = { ...this.data, selectedMappings: selectedMappings };
        return new DataImport(this.api, this.config, this.importPrefix, newData);
    }

    public setSelectedOUs(selectedOUs: string[]) {
        const newData = { ...this.data, selectedOUs: selectedOUs };
        return new DataImport(this.api, this.config, this.importPrefix, newData);
    }

    public setPeriodInformation(newPeriodInformation: PeriodInformation) {
        const newData = { ...this.data, periodInformation: newPeriodInformation };
        return new DataImport(this.api, this.config, this.importPrefix, newData);
    }

    public async save() {
        await this.dataStore.save(this.importKey, this.data);
    }

    public async run(): Promise<{ success: boolean; failures: string[]; messages: string[] }> {
        console.log("object", this.data);
        let failures: string[] = [];
        let messages: string[] = [];
        try {
            // const credentials = await api.get<Credentials>("/tokens/google").getData();

            // Workaround until we have a working dhis-google-auth.json
            const tokenUrl = "https://play.dhis2.org/2.33dev/api/tokens/google";
            const auth = { username: "admin", password: "district" };
            const credentials = (await Axios.get(tokenUrl, { auth })).data;

            const earthEngine = await EarthEngine.init(credentials);
            const geeDhis2 = GeeDhis2.init(this.api, earthEngine);

            const baseImportConfig: { orgUnits: OrgUnit[]; interval: Interval } = {
                //orgUnits: [{ id: "IyO9ICB0WIn" }, { id: "xloTsC6lk5Q" }],
                orgUnits: this.data.selectedOUs.map(o => {
                    return {
                        id: o.split("/").pop(),
                    } as OrgUnit;
                }),
                interval: {
                    type: "daily",
                    ...buildPeriod(this.data.periodInformation),
                },
            };

            await Promise.all(
                this.data.selectedMappings.map(async selectedMapping => {
                    try {
                        const dataValueSet = await geeDhis2.getDataValueSet({
                            ...baseImportConfig,
                            geeDataSetId: getDataSetValue(
                                selectedMapping.geeImage,
                                this.config,
                                "pointer"
                            ),
                            mapping: getAttributeMappings(
                                selectedMapping.attributeMappingDictionary
                            ),
                        });

                        console.log({ dataValueSet });

                        const res = await geeDhis2.postDataValueSet(dataValueSet);
                        console.log("mapping_response", res);
                        messages = [
                            ...messages,
                            getImportCountString(
                                res.importCount,
                                getDataSetValue(
                                    selectedMapping.geeImage,
                                    this.config,
                                    "displayName"
                                )
                            ),
                        ];
                    } catch (err) {
                        failures = [...failures, err];
                    }
                })
            );
            return {
                success: _.isEmpty(failures),
                messages: messages,
                failures: failures,
            };
        } catch (err) {
            return {
                success: false,
                messages: messages,
                failures: [...failures, i18n.t("Import config failed.")],
            };
        }
    }
}
