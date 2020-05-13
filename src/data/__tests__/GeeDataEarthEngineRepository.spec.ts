describe("GeeDataEarthEngineRepository", () => {
    describe("create", () => {
        it("should return true", () => {
            expect(helperFunction(true)).toBe(true);
        });
    });
});

export {};

function helperFunction(value: boolean): boolean {
    return value;
}
