export type UnexpectedError = {
    kind: "UnexpectedError";
    error: Error;
};

export type ItemIdNotFoundError = {
    kind: "ItemIdNotFoundError";
    id: string;
};

export interface ValidationErrors {
    kind: "ValidationErrors";
    errors: ErrorsDictionary;
}

export type ErrorsDictionary = Record<string, string[]>;
