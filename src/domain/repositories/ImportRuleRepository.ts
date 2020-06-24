import { ImportRule } from "../entities/ImportRule";
import { Id } from "../entities/Ref";
import { Maybe } from "../common/Maybe";
import { Either } from "../common/Either";
import { UnexpectedError } from "../errors/Generic";

export interface ImportRuleFilters {
    ids?: Id[];
    search?: string;
    lastExecuted?: Date;
}

export type DeleteImportRulesByIdError = UnexpectedError;
export type SaveError = UnexpectedError;

export interface ImportRuleRepository {
    getById(id: Id): Promise<Maybe<ImportRule>>;
    getAll(filters?: ImportRuleFilters): Promise<ImportRule[]>;
    deleteByIds(ids: Id[]): Promise<Either<DeleteImportRulesByIdError, true>>;
    save(importRule: ImportRule): Promise<Either<SaveError, true>>;
    saveAll(importRules: ImportRule[]): Promise<Either<SaveError, true>>;
}
