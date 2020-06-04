import { Id, generateId } from "./Ref";
import { PeriodOption } from "./PeriodOption";

export const importRuleDefaultId = "default";

export interface ImportRuleWritableData {
    name: string;
    code?: string;
    description?: string;
    selectedOUs: string[];
    periodInformation: PeriodOption;
    selectedMappings: string[];
}

export interface ImportRuleProtectedData {
    id: Id;
    created: Date;
    lastUpdated: Date;
    lastExecuted?: Date;
}

type ImportRuleData = ImportRuleWritableData & ImportRuleProtectedData;

export class ImportRule {
    public readonly id: Id;
    public readonly name: string;
    public readonly code?: string;
    public readonly description?: string;
    public readonly selectedOUs: string[];
    public readonly periodInformation: PeriodOption;
    public readonly selectedMappings: string[];
    public readonly created: Date;
    public readonly lastUpdated: Date;
    public readonly lastExecuted?: Date;

    private constructor(private data: ImportRuleData) {
        this.id = data.id;
        this.name = data.name;
        this.code = data.code;
        this.description = data.description;
        this.selectedOUs = data.selectedOUs;
        this.periodInformation = data.periodInformation;
        this.selectedMappings = data.selectedMappings;
        this.created = data.created;
        this.lastUpdated = data.lastUpdated;
        this.lastExecuted = data.lastExecuted;
    }

    public static createNew(newData: ImportRuleWritableData) {
        return new ImportRule({
            ...newData,
            id: generateId(),
            created: new Date(),
            lastUpdated: new Date(),
        });
    }

    public static createExisted(data: ImportRuleData) {
        return new ImportRule(data);
    }

    public get isDefault(): boolean {
        return this.id === importRuleDefaultId;
    }

    public changeMappings(selectedMappings: string[]): ImportRule {
        const newData = {
            ...this.data,
            selectedMappings: selectedMappings,
        };
        return new ImportRule(newData).updateLastUpdated();
    }

    public changeOUs(selectedOUs: string[]): ImportRule {
        const newData = { ...this.data, selectedOUs: selectedOUs };
        return new ImportRule(newData);
    }

    public changePeriod(period: PeriodOption): ImportRule {
        const newData = { ...this.data, periodInformation: period };
        return new ImportRule(newData).updateLastUpdated();
    }

    public changeName(name: string): ImportRule {
        const newData = { ...this.data, name };
        return new ImportRule(newData).updateLastUpdated();
    }

    public changeDescription(description?: string): ImportRule {
        const newData = { ...this.data, description };
        return new ImportRule(newData).updateLastUpdated();
    }

    public changeCode(code?: string): ImportRule {
        const newData = { ...this.data, code };
        return new ImportRule(newData).updateLastUpdated();
    }

    public updateLastUpdated(): ImportRule {
        const newData = { ...this.data, lastUpdated: new Date() };
        return new ImportRule(newData);
    }

    public updateLastExecuted(): ImportRule {
        const newData = { ...this.data, lastExecuted: new Date() };
        return new ImportRule(newData).updateLastUpdated();
    }
}
