import { ImportRule } from "../entities/ImportRule";
import { Id } from "../entities/Ref";
import { Maybe } from "../common/Maybe";
import { Either } from "../common/Either";

export interface ImportRuleFilters {
    search?: string;
    lastExecuted?: Date;
}

export type ImportRuleIdNotFound = {
    kind: "ImportRuleIdNotFound";
    id: string;
};

export type UnexpectedError = {
    kind: "UnexpectedError";
    error: Error;
};

export type DeleteByIdError = ImportRuleIdNotFound | UnexpectedError;

export interface ImportRuleRepository {
    getDefault(): Promise<ImportRule>;
    getById(id: Id): Promise<Maybe<ImportRule>>;
    getAll(filters?: ImportRuleFilters): Promise<ImportRule[]>;
    deleteById(id: Id): Promise<Either<DeleteByIdError, true>>;
}
