import { D2Api } from "d2-api";
import _ from "lodash";
import DataStore from "d2-api/api/dataStore";
import { getDataStore, getImportCountString } from "../utils/dhis2";
import { Config } from "./Config";
import i18n from "../locales";
import { EarthEngine, Interval, Credentials } from "./EarthEngine";
import { GeeDhis2, OrgUnit, DataValueSet } from "./GeeDhis2";
import Mapping from "./Mapping";
import { getAttributeMappings, getDataSetValue } from "../utils/gee";
import { buildPeriod, downloadFile } from "../utils/import";

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
        await this.dataStore.save(this.importKey, this.data).getData();
    }

    public async run(
        dryRun: boolean,
        api: D2Api
    ): Promise<{ success: boolean; failures: string[]; messages: string[] }> {
        let failures: string[] = [];
        let messages: string[] = [];
        try {
            const credentials = await api.get<Credentials>("/tokens/google").getData();

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
            let importDataValueSet: DataValueSet = { dataValues: [] };

            await Promise.all(
                this.data.selectedMappings.map(async selectedMapping => {
                    try {
                        const dataValueSet: DataValueSet = await geeDhis2.getDataValueSet({
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

                        importDataValueSet = {
                            dataValues: _.concat(
                                importDataValueSet.dataValues,
                                dataValueSet.dataValues
                            ),
                        };
                        messages = [
                            ...messages,
                            i18n.t("{{n}} data values from {{name}} google data set.", {
                                name: getDataSetValue(
                                    selectedMapping.geeImage,
                                    this.config,
                                    "displayName"
                                ),
                                n: dataValueSet.dataValues.length,
                            }),
                        ];
                    } catch (err) {
                        failures = [...failures, err];
                    }
                })
            );
            if (!dryRun) {
                const res = await geeDhis2.postDataValueSet(importDataValueSet);
                messages = [...messages, getImportCountString(res.importCount)];
            } else {
                messages = [...messages, i18n.t("No effective import into DHIS2, file download")];
                downloadFile({
                    filename: "data.json",
                    mimeType: "application/json",
                    contents: JSON.stringify(importDataValueSet),
                });
            }
            return {
                success: _.isEmpty(failures) && !_.isEmpty(messages),
                messages: messages,
                failures: failures,
            };
        } catch (err) {
            return {
                success: false,
                messages: messages,
                failures: [...failures, i18n.t("Import config failed"), err],
            };
        }
    }
}
