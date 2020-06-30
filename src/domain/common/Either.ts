export abstract class Either<Error, Data> {
    constructor(readonly value: Error | Data) {
        this.value = value;
    }

    isFailure(): boolean {
        return this instanceof Failure;
    }
    isSuccess(): boolean {
        return this instanceof Success;
    }

    map<T>(fn: (r: Data) => T): Either<Error, T> {
        return this.flatMap(r => new Success<T>(fn(r)));
    }

    flatMap<T>(fn: (right: Data) => Either<Error, T>): Either<Error, T> {
        return this.isFailure() ? new Failure<Error>(this.value as Error) : fn(this.value as Data);
    }

    fold<T>(leftFn: (left: Error) => T, rightFn: (right: Data) => T): T {
        return this.isFailure() ? leftFn(this.value as Error) : rightFn(this.value as Data);
    }

    static failure<Error>(left: Error) {
        return new Failure<Error>(left);
    }

    static Success<Data>(right: Data) {
        return new Success<Data>(right);
    }
}

export class Failure<Error> extends Either<Error, never> {}

export class Success<Data> extends Either<never, Data> {}
