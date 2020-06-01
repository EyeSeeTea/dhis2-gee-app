import { ImportRule } from "../entities/ImportRule";
import { Id } from "../entities/Ref";
import { Maybe } from "../common/Maybe";

export interface ImportRuleFilters {
    search?: string;
    lastExecuted?: Date;
}

export interface ImportRuleRepository {
    getDefault(): Promise<ImportRule>;
    getById(id: Id): Promise<Maybe<ImportRule>>;
    getAll(filters?: ImportRuleFilters): Promise<ImportRule[]>;
}
