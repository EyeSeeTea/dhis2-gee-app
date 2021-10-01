import { TransformExpression, evalTransformExpression, trasnformExpressionToken } from "../TransformExpression";

const fahrenheitToCelsius = `(${trasnformExpressionToken} - 32 ) * 5/9`;
const celsiusToFahrenheit = `(${trasnformExpressionToken} * 9/5) + 32`;

describe("TransformExpression", () => {
    describe("TransformExpression.create", () => {
        it("should return empty error", async () => {
            const creationResult = TransformExpression.create("");

            expect(creationResult.isError()).toBeTruthy();
        });
        it("should return invalid math expression error if input variable in wrong", async () => {
            const creationResult = TransformExpression.create("(#{wronginput}×9/5)+32");

            expect(creationResult.isError()).toBeTruthy();
        });
        it("should return invalid  math expression error exists unexpected tokens", async () => {
            const creationResult = TransformExpression.create("(ffffff×9/5)+32");

            expect(creationResult.isError()).toBeTruthy();
        });
        it("should return math expression", async () => {
            const creationResult = TransformExpression.create(fahrenheitToCelsius);

            expect(creationResult.isSuccess()).toBeTruthy();
        });
    });
    describe("evalTransformExpression", () => {
        it("should return unexpected error if formula contains input variable and its value is not a number", async () => {
            const geeValue = "WrongTextValue";

            const result = TransformExpression.create(fahrenheitToCelsius).flatMap(formula =>
                evalTransformExpression(formula, +geeValue)
            );

            result.fold(
                error => expect(error).toBeTruthy(),
                () =>
                    fail(
                        `Should fail evaluating math expression ${fahrenheitToCelsius} with geeValue ${geeValue} but success`
                    )
            );
        });
        it("should return expected number for fahrenheit->celsius formula", async () => {
            const geeValue = 75.2;

            const result = TransformExpression.create(fahrenheitToCelsius).flatMap(formula =>
                evalTransformExpression(formula, geeValue)
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

            const result = TransformExpression.create(celsiusToFahrenheit).flatMap(formula =>
                evalTransformExpression(formula, geeValue)
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
