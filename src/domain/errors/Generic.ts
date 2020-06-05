export type UnexpectedError = {
    kind: "UnexpectedError";
    error: Error;
};

export interface ValidationErrors {
    kind: "ValidationErrors";
    errors: ErrorsDictionary;
}

export type ErrorsDictionary = Record<string, string[]>;
