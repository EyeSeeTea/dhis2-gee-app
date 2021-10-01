import { Id, generateId } from "./Ref";
import { PeriodOption } from "./PeriodOption";
import { ValidationErrors, ErrorsDictionary } from "../errors/Generic";
import { Either } from "../common/Either";
import { validateRequired } from "../utils/Validations";

export const importRuleOndemandId = "ondemand";

export interface ImportRuleWritableData {
    name: string;
    code?: string;
    description?: string;
    selectedOUs: string[];
    periodInformation?: PeriodOption;
    selectedMappings: string[];
}

export interface ImportRuleProtectedData {
    id: Id;
    created: Date;
    lastUpdated: Date;
    lastExecuted?: Date;
}

export type ImportRuleData = ImportRuleWritableData & ImportRuleProtectedData;

export class ImportRule {
    public readonly id: Id;
    public readonly name: string;
    public readonly code?: string;
    public readonly description?: string;
    public readonly selectedOUs: string[];
    public readonly periodInformation?: PeriodOption;
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

    public static createNew(newData: ImportRuleWritableData): Either<ValidationErrors, ImportRule> {
        const errors = validate(newData);

        if (Object.keys(errors).length > 0) {
            return Either.error({ kind: "ValidationErrors", errors });
        } else {
            return Either.success(
                new ImportRule({
                    ...newData,
                    id: generateId(),
                    created: new Date(),
                    lastUpdated: new Date(),
                })
            );
        }
    }

    public static createExisted(data: ImportRuleData) {
        return new ImportRule(data);
    }

    public get isOndemand(): boolean {
        return this.id === importRuleOndemandId;
    }

    public update(newData: ImportRuleWritableData): Either<ValidationErrors, ImportRule> {
        const errors = validate(newData);

        if (Object.keys(errors).length > 0) {
            return Either.error({ kind: "ValidationErrors", errors });
        } else {
            return Either.success(
                new ImportRule({
                    ...this.data,
                    name: newData.name,
                    code: newData.code,
                    description: newData.description,
                    selectedOUs: newData.selectedOUs,
                    periodInformation: newData.periodInformation,
                    selectedMappings: newData.selectedMappings,
                }).updateLastUpdated()
            );
        }
    }

    public updateSelectedMapping(selectedMappings: Id[]): ImportRule {
        return new ImportRule({ ...this.data, selectedMappings }).updateLastUpdated();
    }

    public updateLastExecuted(): ImportRule {
        return new ImportRule({ ...this.data, lastExecuted: new Date() }).updateLastUpdated();
    }

    private updateLastUpdated(): ImportRule {
        return new ImportRule({ ...this.data, lastUpdated: new Date() });
    }
}

function validate(values: ImportRuleWritableData): ErrorsDictionary {
    const errors: ErrorsDictionary = {
        name: validateRequired("name", values.name),
    };

    Object.keys(errors).forEach((key: string) => errors[key]?.length === 0 && delete errors[key]);

    return errors;
}
