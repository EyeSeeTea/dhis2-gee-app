import { Id } from "./Ref";
import { PeriodOption } from "./PeriodOption";

export const importRuleDefaultId = "default";

export interface ImportRuleData {
    id: string;
    name: string;
    code?: string;
    created: Date;
    description?: string;
    selectedOUs: string[];
    periodInformation: PeriodOption;
    selectedMappings: Mapping[];
    lastExecuted?: Date;
    lastUpdated: Date;
}

export interface Mapping {
    id: Id;
    name: string;
    description: string;
    dataSetId: string;
    dataSetName: string;
    geeImage: string;
    created: Date;
    attributeMappingDictionary: AttributeMappingDictionary;
}

export interface AttributeMappingDictionary {
    [geeBand: string]: AttributeMapping;
}

export interface AttributeMapping {
    id: string;
    geeBand: string;
    comment: string;
    dataElementId?: string;
    dataElementCode?: string;
    dataElementName?: string;
}

export class ImportRule {
    public readonly id: string;
    public readonly name: string;
    public readonly code?: string;
    public readonly created: Date;
    public readonly description?: string;
    public readonly selectedOUs: string[];
    public readonly periodInformation: PeriodOption;
    public readonly selectedMappings: Mapping[];
    public readonly lastExecuted?: Date;
    public readonly lastUpdated: Date;

    constructor(private data: ImportRuleData) {
        this.id = data.id;
        this.name = data.name;
        this.code = data.code;
        this.created = data.created;
        this.description = data.description;
        this.selectedOUs = data.selectedOUs;
        this.periodInformation = data.periodInformation;
        this.selectedMappings = data.selectedMappings;
        this.lastExecuted = data.lastExecuted;
        this.lastUpdated = data.lastUpdated;
    }

    public get isDefault(): boolean {
        return this.id === importRuleDefaultId;
    }

    public changeMappings(selectedMappings: Mapping[]) {
        const newData = { ...this.data, selectedMappings: selectedMappings };
        return new ImportRule(newData);
    }

    public changeOUs(selectedOUs: string[]) {
        const newData = { ...this.data, selectedOUs: selectedOUs };
        return new ImportRule(newData);
    }

    public changePeriod(period: PeriodOption) {
        const newData = { ...this.data, periodInformation: period };
        return new ImportRule(newData);
    }

    public updateLastExecuted() {
        const newData = { ...this.data, lastExecuted: new Date() };
        return new ImportRule(newData);
    }
}
