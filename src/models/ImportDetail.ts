import { D2Api } from "d2-api";
import DataStore from "d2-api/api/dataStore";
import { getDataStore } from "../utils/dhis2";
import { Config } from "./Config";
import i18n from "../locales";

export interface ImportData {
    name: string | undefined;
    description: string | undefined;
    id: string | undefined;
    mappingSet: string[] | undefined;
}

const defaultProjectData = {
    id: undefined,
    name: "",
    description: "",
    mappingSet: [],
};

export type ImportField = keyof ImportData;

export class ImportDetailModel {
    dataStore: DataStore;
    data: ImportData | undefined;
    importKey: string;

    static fieldNames: Record<ImportField, string> = {
        id: i18n.t("Id"),
        name: i18n.t("Name"),
        description: i18n.t("Description"),
        mappingSet: i18n.t("Selected mappings"),
    };

    static getFieldName(field: ImportField): string {
        return this.fieldNames[field];
    }

    constructor(private api: D2Api, private config: Config, public importPrefix: string) {
        this.dataStore = getDataStore(this.api, this.config);
        this.data = defaultProjectData;
        this.importKey = importPrefix + config.data.base.dataStore.keys.imports.suffix;
    }

    async getImportData() {
        this.data = await this.dataStore.get<ImportData>(this.importKey).getData();
        console.log(this.data);
        if (!this.data) {
            console.error("Cannot find import " + this.importKey);
        }
        return this.data?.mappingSet || [];
    }

    public setMappingSet(selectedMappingIds: string[]) {
        if (!this.data) this.data = defaultProjectData;
        this.data.mappingSet = selectedMappingIds;
    }

    public save() {
        console.log(this.data);
        this.dataStore.save(this.importKey, this.data || defaultProjectData);
    }
}
