import { Either } from "../common/Either";
import Mexp from "math-expression-evaluator";
import { UnexpectedError } from "../errors/Generic";

export interface InvalidMathExpression {
    kind: "InvalidMathExpression";
}

export interface InvalidEmptyMathExpression {
    kind: "InvalidEmptyMathExpression";
}

export type MathExpressionError =
    | InvalidMathExpression
    | InvalidEmptyMathExpression
    | UnexpectedError;

export type EvalMathExpressionError = UnexpectedError;

export const mathExpressionToken = "#{input}";

export class MathExpression {
    private constructor(public value: string) {}

    public static create(formula: string): Either<MathExpressionError, MathExpression> {
        try {
            if (!formula && formula.trim().length === 0) {
                return Either.failure({ kind: "InvalidEmptyMathExpression" });
            } else if (!this.isValid(formula)) {
                return Either.failure({ kind: "InvalidMathExpression" });
            } else {
                return Either.Success(new MathExpression(formula.trim()));
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

export const evalMathExpression = (
    formula: MathExpression,
    inputValue: number
): Either<EvalMathExpressionError, number> => {
    try {
        const result = evalRawMathExpression(formula.value, inputValue);

        return Either.Success(result);
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
            token: mathExpressionToken,
            show: mathExpressionToken,
            preced: 0,
            value: mathExpressionToken,
        },
    ]);

    return +Mexp.eval(expression, { [mathExpressionToken]: inputValue });
}
