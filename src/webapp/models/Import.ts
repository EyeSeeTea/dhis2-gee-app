import { D2Api } from "d2-api";
import DataStore from "d2-api/api/dataStore";
import { getDataStore } from "../utils/dhis2";
import { Config } from "./Config";
import i18n from "../locales";
import Mapping from "./Mapping";
import { ImportRule } from "../../domain/entities/ImportRule";

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

    public getImportRule(): ImportRule {
        // TODO: ImportRule is this model transformed in new domain entity
        // To the future this model should disappear when it's no used
        return (this.data as unknown) as ImportRule;
    }
}
