import { D2Api } from "d2-api";
import DataStore from "d2-api/api/dataStore";
import { getDataStore } from "../utils/dhis2";
import { Config } from "./Config";
import i18n from "../locales";

export interface DataImportData {
    name: string | undefined;
    description: string | undefined;
    id: string | undefined;
    selectedMappings: string[];
}

const defaultProjectData = {
    id: undefined,
    name: "",
    description: "",
    mappingSet: [],
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
            console.error("Cannot find import " + importKey);
            return;
        }
        return new DataImport(api, config, importPrefix, data);
    }

    public setSelectedMappings(selectedMappings: string[]) {
        /*if (!this.data) this.data = defaultProjectData;
        this.data.mappingSet = selectedMappingIds;*/
        const newData = { ...this.data, selectedMappings: selectedMappings };
        return new DataImport(this.api, this.config, this.importPrefix, newData);
    }

    public async save() {
        await this.dataStore.save(this.importKey, this.data || defaultProjectData);
    }
}
