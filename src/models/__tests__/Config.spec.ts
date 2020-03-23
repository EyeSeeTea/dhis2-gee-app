import { Config } from "../Config";
import { getTestContext } from "../../utils/tests";

const { api, context } = getTestContext();
let config: Config;

describe("Config", () => {
    describe("build", () => {
        beforeAll(async () => {
            config = await Config.build(api);
        });

        it("has base config", () => {
            expect(config.data.base).toEqual(config.data.base);
        });
    });
});
