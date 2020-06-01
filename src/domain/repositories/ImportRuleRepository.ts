import DataElement from "../entities/DataElement";
import { ImportRule } from "../entities/ImportRule";

export interface ImportRuleFilters {
    search?: string;
    lastExecuted?: Date;
}

export interface ImportRuleRepository {
    getAll(filters?: ImportRuleFilters): Promise<ImportRule[]>;
}
