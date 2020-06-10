import { MathExpression, evalMathExpression, mathExpressionToken } from "../MathExpression";

const fahrenheitToCelsius = `(${mathExpressionToken} - 32 ) * 5/9`;
const celsiusToFahrenheit = `(${mathExpressionToken} * 9/5) + 32`;

describe("MathExpression", () => {
    describe("MathExpression.create", () => {
        it("should return empty error", async () => {
            const creationResult = MathExpression.create("");

            expect(creationResult.isFailure()).toBeTruthy();
        });
        it("should return invalid math expression error if input variable in wrong", async () => {
            const creationResult = MathExpression.create("(#{wronginput}×9/5)+32");

            expect(creationResult.isFailure()).toBeTruthy();
        });
        it("should return invalid  math expression error exists unexpected tokens", async () => {
            const creationResult = MathExpression.create("(ffffff×9/5)+32");

            expect(creationResult.isFailure()).toBeTruthy();
        });
        it("should return math expression", async () => {
            const creationResult = MathExpression.create(fahrenheitToCelsius);

            expect(creationResult.isSuccess()).toBeTruthy();
        });
    });
    describe("evalMathExpression", () => {
        it("should return unexpected error if formula contains input variable and its value is not a number", async () => {});
        it("should return expected number for fahrenheit->celsius formula", async () => {
            const geeValue = 75.2;

            const result = MathExpression.create(fahrenheitToCelsius).flatMap(formula =>
                evalMathExpression(formula, geeValue)
            );

            result.fold(
                error =>
                    fail(
                        `Error evaluating math expression ${fahrenheitToCelsius} with geeValue ${geeValue}: ${error.kind}`
                    ),
                numberResult => expect(numberResult).toBe(24)
            );
        });
        it("should return expected number for celsius->fahrenheit formula", async () => {
            const geeValue = 24;

            const result = MathExpression.create(celsiusToFahrenheit).flatMap(formula =>
                evalMathExpression(formula, geeValue)
            );

            result.fold(
                error =>
                    fail(
                        `Error evaluating math expression ${celsiusToFahrenheit} with geeValue ${geeValue}: ${error.kind}`
                    ),
                numberResult => expect(numberResult).toBe(75.2)
            );
        });
    });
});

export {};

function fail(message: string) {
    throw new Error(message);
}
