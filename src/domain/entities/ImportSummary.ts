import { generateId } from "./Ref";
import { Id } from "@eyeseetea/d2-api";

export type ImportSummaryStatus = "FAILURE" | "SUCCESS";

export interface ImportResult {
    success: boolean;
    failures: string[];
    messages: string[];
}

interface ImportSummaryInputs {
    username?: string;
    importRule?: Id;
    result: ImportResult;
}

export interface ImportSummaryData {
    readonly id: string;
    readonly date: Date;
    readonly user: string;
    readonly status: ImportSummaryStatus;
    readonly importRule?: string;
    readonly importRuleLabel?: string;
    readonly result: ImportResult;
}

export class ImportSummary implements ImportSummaryData {
    public readonly id: string;
    public readonly date: Date;
    public readonly user: string;
    public readonly status: ImportSummaryStatus;
    public readonly importRule?: string;
    public readonly importRuleLabel?: string;
    public readonly result: ImportResult;

    private constructor(private data: ImportSummaryData) {
        this.id = this.data.id;
        this.date = this.data.date;
        this.user = this.data.user;
        this.status = this.data.status;
        this.importRule = this.data.importRule;
        this.importRuleLabel = this.data.importRuleLabel;
        this.result = this.data.result;
    }

    public static createNew(inputs: ImportSummaryInputs): ImportSummary {
        //TODO: create validations?
        return new ImportSummary({
            id: generateId(),
            date: new Date(),
            user: inputs.username ?? "unknown",
            status: inputs.result.success ? "SUCCESS" : "FAILURE",
            importRule: inputs.importRule,
            result: inputs.result,
        });
    }

    public static createExisted(data: ImportSummaryData): ImportSummary {
        //TODO: create validations?
        return new ImportSummary(data);
    }

    public updateWithDeletedImportRule(importRuleLabel: string): ImportSummary {
        return new ImportSummary({ ...this.data, importRuleLabel: importRuleLabel });
    }
}
