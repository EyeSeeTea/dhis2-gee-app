import { Either } from "../common/Either";
import Mexp from "math-expression-evaluator";
import { UnexpectedError } from "../errors/Generic";

export interface InvalidTransformExpression {
    kind: "InvalidTransformExpression";
}

export interface InvalidEmptyTransformExpression {
    kind: "InvalidEmptyTransformExpression";
}

export type TransformExpressionError =
    | InvalidTransformExpression
    | InvalidEmptyTransformExpression
    | UnexpectedError;

export type EvalTransformExpressionError = UnexpectedError;

export const trasnformExpressionToken = "#{input}";

export class TransformExpression {
    private constructor(public value: string) {}

    public static create(formula: string): Either<TransformExpressionError, TransformExpression> {
        try {
            if (!formula && formula.trim().length === 0) {
                return Either.failure({ kind: "InvalidEmptyTransformExpression" });
            } else if (!this.isValid(formula)) {
                return Either.failure({ kind: "InvalidTransformExpression" });
            } else {
                return Either.Success(new TransformExpression(formula.trim()));
            }
        } catch (e) {
            return Either.failure({
                kind: "UnexpectedError",
                error: e,
            });
        }
    }

    private static isValid(formula: string): boolean {
        try {
            evalRawMathExpression(formula, 5);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export const evalTransformExpression = (
    formula: TransformExpression,
    inputValue: number
): Either<EvalTransformExpressionError, number> => {
    try {
        const result = evalRawMathExpression(formula.value, inputValue);

        return isNaN(result)
            ? Either.failure({
                  kind: "UnexpectedError",
                  error: new Error(
                      `Unexpected invalid NaN result applying expression ${formula.value} to value ${inputValue}`
                  ),
              })
            : Either.Success(result);
    } catch (e) {
        return Either.failure({
            kind: "UnexpectedError",
            error: e,
        });
    }
};

function evalRawMathExpression(expression: string, inputValue: number): number {
    Mexp.addToken([
        {
            type: 3,
            token: trasnformExpressionToken,
            show: trasnformExpressionToken,
            preced: 0,
            value: trasnformExpressionToken,
        },
    ]);

    return +Mexp.eval(expression, { [trasnformExpressionToken]: inputValue });
}
